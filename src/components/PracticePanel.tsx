import { useCallback, useEffect, useRef, useState } from 'react';
import type { Language, SuggestedPhrase, Timepoint } from '../types';
import { LanguageTabs } from './LanguageTabs';
import { PhraseDisplay } from './PhraseDisplay';
import { PlaybackControls } from './PlaybackControls';
import { PlayCounter } from './PlayCounter';
import { AISuggestModal } from './AISuggestModal';
import { useTTS } from '../hooks/useTTS';
import { usePlayback } from '../hooks/usePlayback';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import {
  isWebSpeechAvailable,
  speakWithWebSpeech,
  warmUpSpeechSynthesis,
  type WebSpeechHandle,
} from '../services/webSpeechTTS';
import { base64ToAudioUrl, getCachedSpeech } from '../services/googleTTS';
import { isIOS, unlockAudio } from '../utils/audioUnlock';
import { normalizeLoopCount } from '../utils/loopCount';
import { LANGUAGE_CONFIG } from '../types';

interface Props {
  language: Language;
  loopCount: number;
  speed: number;
  anthropicApiKey: string;
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
  anthropicApiKey,
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
  const [text, setText] = useState(initialText ?? "I'm beat.");
  const { translation, translating, setTranslation } = useAutoTranslate(
    text,
    language,
  );
  const [showAI, setShowAI] = useState(false);
  const [sessionToday, setSessionToday] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [webSpeechPlaying, setWebSpeechPlaying] = useState(false);
  const [webSpeechWordIndex, setWebSpeechWordIndex] = useState(-1);

  const webSpeechRef = useRef<WebSpeechHandle | null>(null);
  const optsRef = useRef({ language, speed, loopCount, activePhraseId });

  optsRef.current = {
    language,
    speed,
    loopCount: normalizeLoopCount(loopCount),
    activePhraseId,
  };

  const { fetchAudio, loading, error, cleanup, setError } = useTTS(onCharUsed);
  const { play, stop: stopAudio, togglePause, isPlaying, activeWordIndex } =
    usePlayback();

  useEffect(() => {
    if (initialText !== undefined) setText(initialText);
  }, [initialText]);

  useEffect(() => {
    if (initialTranslation !== undefined) setTranslation(initialTranslation);
  }, [initialTranslation, setTranslation]);

  useEffect(() => {
    warmUpSpeechSynthesis();
    return () => {
      cleanup();
      webSpeechRef.current?.stop();
    };
  }, [cleanup]);

  const stopAll = useCallback(() => {
    stopAudio();
    webSpeechRef.current?.stop();
    webSpeechRef.current = null;
    setWebSpeechPlaying(false);
    setWebSpeechWordIndex(-1);
  }, [stopAudio]);

  const onLoopComplete = useCallback(() => {
    setSessionToday((t) => t + 1);
    setSessionTotal((t) => t + 1);
    if (optsRef.current.activePhraseId) {
      onPlayRecorded(optsRef.current.activePhraseId);
    }
  }, [onPlayRecorded]);

  /** Must run synchronously inside the user's tap — no await before this. */
  const playWithWebSpeech = useCallback(
    (phraseText: string) => {
      if (!isWebSpeechAvailable()) {
        setError('この端末では音声再生に対応していません');
        return;
      }

      unlockAudio();
      stopAll();
      setError(null);
      setStatusMsg('📱 端末音声で再生中');

      const { language: lang, speed: spd, loopCount: loops } = optsRef.current;

      webSpeechRef.current = speakWithWebSpeech(
        phraseText,
        lang,
        spd,
        loops,
        {
          onWordIndex: setWebSpeechWordIndex,
          onPlayingChange: setWebSpeechPlaying,
          onLoopComplete,
          onError: (msg) => setError(msg),
        },
      );
    },
    [stopAll, onLoopComplete, setError],
  );

  const playWithGoogleTts = useCallback(
    async (phraseText: string) => {
      setStatusMsg(null);
      setError(null);
      stopAll();
      unlockAudio();

      const { language: lang, speed: spd, loopCount: loops } = optsRef.current;
      const languageLabel = LANGUAGE_CONFIG[lang].label;

      const startPlayback = async (audioUrl: string, timepoints: Timepoint[]) => {
        await play(audioUrl, timepoints, {
          loopCount: loops,
          playbackRate: spd,
          phraseText,
          languageLabel,
          onLoopComplete,
        });
      };

      try {
        const cached = await getCachedSpeech(phraseText, lang, spd);
        if (cached) {
          await startPlayback(
            base64ToAudioUrl(cached.audioContent, cached.mimeType ?? 'audio/mp3'),
            cached.timepoints,
          );
          return;
        }

        const result = await fetchAudio(phraseText, lang, spd);
        await startPlayback(result.audioUrl, result.timepoints);
      } catch (e) {
        const message =
          e instanceof Error
            ? e.message
            : '音声の取得に失敗しました。もう一度▶をタップしてください';
        setError(message);
        setStatusMsg(
          isIOS()
            ? '📱 端末音声で再生します（ロック画面では止まる場合があります）'
            : '端末音声で再生します',
        );
        playWithWebSpeech(phraseText);
      }
    },
    [fetchAudio, play, stopAll, onLoopComplete, playWithWebSpeech, setError],
  );

  const handlePlay = useCallback(() => {
    if (!text.trim()) return;
    unlockAudio();
    void playWithGoogleTts(text);
  }, [text, playWithGoogleTts]);

  const handlePreview = useCallback(
    (previewText: string) => {
      setText(previewText);
      unlockAudio();
      void playWithGoogleTts(previewText);
    },
    [playWithGoogleTts],
  );

  const handleTogglePause = useCallback(() => {
    if (webSpeechRef.current) {
      webSpeechRef.current.togglePause();
    } else {
      togglePause();
    }
  }, [togglePause]);

  const handleStop = useCallback(() => {
    stopAll();
    setStatusMsg(null);
  }, [stopAll]);

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

  const playing = isPlaying || webSpeechPlaying;
  const highlightIndex = webSpeechPlaying ? webSpeechWordIndex : activeWordIndex;

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
        ✨ フレーズを提案してもらう
      </button>

      <PhraseDisplay
        text={text}
        activeWordIndex={highlightIndex}
        isPlaying={playing}
        translation={translation || undefined}
        translating={translating}
      />

      <PlaybackControls
        loopCount={loopCount}
        speed={speed}
        isPlaying={playing}
        isLoading={loading}
        canPlay={!!text.trim()}
        onLoopChange={onLoopChange}
        onSpeedChange={onSpeedChange}
        onPlay={handlePlay}
        onTogglePause={handleTogglePause}
        onStop={handleStop}
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
        {statusMsg && (
          <p className="text-sm text-violet-300 text-center">{statusMsg}</p>
        )}
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        <p className="text-xs text-gray-500 text-center">
          ロック画面・バックグラウンドでも再生を続けられます（▶ タップ後）
        </p>
      </div>

      <AISuggestModal
        open={showAI}
        language={language}
        anthropicApiKey={anthropicApiKey}
        onClose={() => setShowAI(false)}
        onSelect={handleAISelect}
        onPreview={handlePreview}
      />
    </div>
  );
}
