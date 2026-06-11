import { useCallback, useState } from 'react';
import type { Language, Phrase } from './types';
import { normalizeLoopCount } from './utils/loopCount';
import { PracticePanel } from './components/PracticePanel';
import { PhraseLibrary } from './components/PhraseLibrary';
import { TemplateLibrary } from './components/TemplateLibrary';
import { SettingsModal } from './components/SettingsModal';
import { UpdateBanner } from './components/UpdateBanner';
import { usePhraseStore } from './hooks/usePhraseStore';
import { useSettings } from './hooks/useSettings';

type View = 'practice' | 'templates' | 'library';

export default function App() {
  const { settings, updateSettings, addCharCount } = useSettings();
  const { phrases, addPhrase, deletePhrase, recordPlay, totalPlays, todayPlays } =
    usePhraseStore();

  const [view, setView] = useState<View>('practice');
  const [showSettings, setShowSettings] = useState(false);
  const [language, setLanguage] = useState<Language>(settings.defaultLanguage);
  const [loopCount, setLoopCount] = useState(() =>
    normalizeLoopCount(settings.defaultLoopCount),
  );
  const [speed, setSpeed] = useState(settings.defaultSpeed);
  const [activePhraseId, setActivePhraseId] = useState<string | null>(null);
  const [practiceText, setPracticeText] = useState<string | undefined>();
  const [practiceTranslation, setPracticeTranslation] = useState<
    string | undefined
  >();
  const [practiceTranslationLocked, setPracticeTranslationLocked] =
    useState(false);

  const handlePracticeFromLibrary = useCallback((phrase: Phrase) => {
    setLanguage(phrase.language);
    setPracticeText(phrase.text);
    setPracticeTranslation(phrase.translation);
    setActivePhraseId(phrase.id);
    setPracticeTranslationLocked(false);
    setView('practice');
  }, []);

  const handlePracticeTemplate = useCallback((text: string, translation: string) => {
    setLanguage('en');
    setPracticeText(text);
    setPracticeTranslation(translation);
    setPracticeTranslationLocked(true);
    setActivePhraseId(null);
    setView('practice');
  }, []);

  const handleSave = useCallback(
    (
      text: string,
      lang: Language,
      meta?: { translation?: string; context?: string },
    ) => {
      const phrase = addPhrase(text, lang, meta);
      setActivePhraseId(phrase.id);
    },
    [addPhrase],
  );

  const handlePlayRecorded = useCallback(
    (phraseId: string) => {
      recordPlay(phraseId);
    },
    [recordPlay],
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">🎙️ Rhythm Repeat</h1>
            <p className="text-xs text-gray-500">リズムで叩き込む語学練習</p>
          </div>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-lg transition-colors"
            aria-label="設定"
          >
            ⚙️
          </button>
        </div>

        <nav className="max-w-2xl mx-auto px-4 pb-3 flex gap-1">
          {(
            [
              ['practice', '練習'],
              ['templates', '型'],
              ['library', '保存'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === key
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {view === 'practice' && (
          <PracticePanel
            language={language}
            loopCount={loopCount}
            speed={speed}
            voiceEngine={settings.voiceEngine}
            anthropicApiKey={settings.anthropicApiKey}
            activePhraseId={activePhraseId}
            initialText={practiceText}
            initialTranslation={practiceTranslation}
            lockTranslation={practiceTranslationLocked}
            onLanguageChange={setLanguage}
            onLoopChange={setLoopCount}
            onSpeedChange={setSpeed}
            onSave={handleSave}
            onPlayRecorded={handlePlayRecorded}
            onCharUsed={addCharCount}
          />
        )}
        {view === 'templates' && (
          <TemplateLibrary onPractice={handlePracticeTemplate} />
        )}
        {view === 'library' && (
          <PhraseLibrary
            phrases={phrases}
            totalPlays={totalPlays}
            todayPlays={todayPlays}
            onPractice={handlePracticeFromLibrary}
            onDelete={deletePhrase}
          />
        )}
      </main>

      <SettingsModal
        open={showSettings}
        settings={settings}
        onClose={() => setShowSettings(false)}
        onSave={updateSettings}
      />

      <UpdateBanner />
    </div>
  );
}
