import { useCallback, useEffect, useState } from 'react';
import type { Language, SuggestedPhrase } from '../types';
import { LanguageTabs } from './LanguageTabs';
import { PhraseDisplay } from './PhraseDisplay';
import { PlaybackControls } from './PlaybackControls';
import { PlayCounter } from './PlayCounter';
import { AISuggestModal } from './AISuggestModal';
import { useTTS } from '../hooks/useTTS';
import { usePlayback } from '../hooks/usePlayback';

interface Props {
  language: Language;
  loopCount: number;
  speed: number;
  activePhraseId: string | null;
  initialText?: string;
  initialTranslation?: string;
  onLanguageChange: (lang: Language) => void;
  onLoopChange: (count: number) => void;
  onSpeedChange: (speed: number) => void;
  onSave: (
    text: string,
    lang: Language,
    meta?: { translation?: string; context?: string },
  ) => void;
  onPlayRecorded: (phraseId: string) => void;
  onCharUsed?: (chars: number) => void;
}

export function PracticePanel({
  language,
  loopCount,
  speed,
  activePhraseId,
  initialText,
  initialTranslation,
  onLanguageChange,
  onLoopChange,
  onSpeedChange,
  onSave,
  onPlayRecorded,
  onCharUsed,
}: Props) {
  const [text, setText] = useState(initialText ?? '');
  const [translation, setTranslation] = useState(initialTranslation ?? '');
  const [showAI, setShowAI] = useState(false);
  const [sessionToday, setSessionToday] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const { fetchAudio, loading, error, cleanup } = useTTS(onCharUsed);
  const { play, stop, togglePause, isPlaying, activeWordIndex } = usePlayback();

  useEffect(() => {
    if (initialText !== undefined) setText(initialText);
  }, [initialText]);

  useEffect(() => {
    if (initialTranslation !== undefined) setTranslation(initialTranslation);
  }, [initialTranslation]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const playPhrase = useCallback(
    async (phraseText: string) => {
      setStatusMsg(null);
      try {
        const result = await fetchAudio(phraseText, language, speed);
        await play(result.audioUrl, result.timepoints, {
          loopCount,
          onLoopComplete: () => {
            setSessionToday((t) => t + 1);
            setSessionTotal((t) => t + 1);
            if (activePhraseId) onPlayRecorded(activePhraseId);
          },
        });
      } catch {
        // error handled in useTTS
      }
    },
    [
      language,
      speed,
      loopCount,
      fetchAudio,
      play,
      activePhraseId,
      onPlayRecorded,
    ],
  );

  const handlePlay = useCallback(() => {
    void playPhrase(text);
  }, [playPhrase, text]);

  const handleAISelect = (s: SuggestedPhrase) => {
    setText(s.text);
    setTranslation(s.translation);
    setStatusMsg(null);
  };

  const handleSave = () => {
    if (!text.trim()) return;
    onSave(text, language, { translation: translation || undefined });
    setStatusMsg('ライブラリに保存しました ✓');
  };

  return (
    <div className="flex flex-col gap-6">
      <LanguageTabs language={language} onChange={onLanguageChange} />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter a phrase to practice..."
        rows={2}
        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
      />

      <button
        type="button"
        onClick={() => setShowAI(true)}
        className="w-full py-2.5 rounded-xl border border-violet-600/40 text-violet-400 hover:bg-violet-600/10 text-sm font-medium transition-colors"
      >
        ✨ AIに口語フレーズを提案してもらう
      </button>

      <PhraseDisplay
        text={text}
        activeWordIndex={activeWordIndex}
        isPlaying={isPlaying}
        translation={translation || undefined}
      />

      <PlaybackControls
        loopCount={loopCount}
        speed={speed}
        isPlaying={isPlaying}
        isLoading={loading}
        canPlay={!!text.trim()}
        onLoopChange={onLoopChange}
        onSpeedChange={onSpeedChange}
        onPlay={handlePlay}
        onTogglePause={togglePause}
        onStop={stop}
      />

      <PlayCounter sessionToday={sessionToday} sessionTotal={sessionTotal} />

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!text.trim()}
          className="px-6 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-sm font-medium transition-colors"
        >
          💾 ライブラリに保存
        </button>
        {statusMsg && <p className="text-sm text-green-400">{statusMsg}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      <AISuggestModal
        open={showAI}
        language={language}
        onClose={() => setShowAI(false)}
        onSelect={handleAISelect}
        onPreview={(previewText) => {
          setText(previewText);
          void playPhrase(previewText);
        }}
      />
    </div>
  );
}
