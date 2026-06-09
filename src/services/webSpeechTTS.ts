import type { Language } from '../types';

export type SpeechEngine = 'google' | 'webspeech';

export interface WebSpeechHandle {
  engine: 'webspeech';
  stop: () => void;
  togglePause: () => void;
}

function langCode(language: Language): string {
  return language === 'de' ? 'de-DE' : 'en-US';
}

export function isWebSpeechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakWithWebSpeech(
  text: string,
  language: Language,
  speed: number,
  loopCount: number,
  callbacks: {
    onWordIndex?: (index: number) => void;
    onPlayingChange?: (playing: boolean) => void;
    onLoopComplete?: () => void;
  },
): WebSpeechHandle {
  const words = text.match(/\S+/g) ?? [];
  let loopsDone = 0;
  let stopped = false;
  let paused = false;
  let currentWord = -1;

  const stop = () => {
    stopped = true;
    window.speechSynthesis.cancel();
    callbacks.onPlayingChange?.(false);
    callbacks.onWordIndex?.(-1);
  };

  const togglePause = () => {
    if (stopped) return;
    if (paused) {
      window.speechSynthesis.resume();
      paused = false;
      callbacks.onPlayingChange?.(true);
    } else {
      window.speechSynthesis.pause();
      paused = true;
      callbacks.onPlayingChange?.(false);
    }
  };

  const speakOnce = () => {
    if (stopped) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode(language);
    utterance.rate = speed;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.lang.startsWith(langCode(language)));
    if (preferred) utterance.voice = preferred;

    utterance.onboundary = (event) => {
      if (event.name === 'word' && words.length > 0) {
        const ratio = event.charIndex / Math.max(text.length, 1);
        const idx = Math.min(
          words.length - 1,
          Math.floor(ratio * words.length),
        );
        if (idx !== currentWord) {
          currentWord = idx;
          callbacks.onWordIndex?.(idx);
        }
      }
    };

    utterance.onstart = () => {
      paused = false;
      callbacks.onPlayingChange?.(true);
    };

    utterance.onend = () => {
      if (stopped) return;
      loopsDone++;
      callbacks.onLoopComplete?.();
      callbacks.onWordIndex?.(-1);

      if (loopCount === Infinity || loopsDone < loopCount) {
        speakOnce();
      } else {
        callbacks.onPlayingChange?.(false);
      }
    };

    utterance.onerror = () => {
      if (!stopped) callbacks.onPlayingChange?.(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // iOS Safari: voices load async
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => speakOnce();
  } else {
    speakOnce();
  }

  return { engine: 'webspeech', stop, togglePause };
}
