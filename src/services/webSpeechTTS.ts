import type { Language } from '../types';
import { isIOS } from '../utils/audioUnlock';

export interface WebSpeechHandle {
  engine: 'webspeech';
  stop: () => void;
  togglePause: () => void;
}

function langCode(language: Language): string {
  return language === 'de' ? 'de-DE' : 'en-US';
}

function langPrefix(language: Language): string {
  return language === 'de' ? 'de' : 'en';
}

export function isWebSpeechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Warm up speech synthesis — call from user gesture on iOS. */
export function warmUpSpeechSynthesis(): void {
  if (!isWebSpeechAvailable()) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.cancel();
}

function pickVoice(language: Language): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const prefix = langPrefix(language);
  return (
    voices.find((v) => v.lang.replace('_', '-').startsWith(langCode(language))) ??
    voices.find((v) => v.lang.startsWith(prefix)) ??
    voices.find((v) => v.default) ??
    voices[0]
  );
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
    onError?: (message: string) => void;
  },
): WebSpeechHandle {
  const words = text.match(/\S+/g) ?? [];
  let loopsDone = 0;
  let stopped = false;
  let paused = false;
  let currentWord = -1;
  let started = false;

  const stop = () => {
    stopped = true;
    window.speechSynthesis.cancel();
    callbacks.onPlayingChange?.(false);
    callbacks.onWordIndex?.(-1);
  };

  const togglePause = () => {
    if (stopped || isIOS()) return; // iOS pause/resume is unreliable
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

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode(language);
    utterance.rate = Math.min(2, Math.max(0.5, speed));

    const voice = pickVoice(language);
    if (voice) utterance.voice = voice;

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
      started = true;
      paused = false;
      callbacks.onPlayingChange?.(true);
    };

    utterance.onend = () => {
      if (stopped) return;
      loopsDone++;
      callbacks.onLoopComplete?.();
      callbacks.onWordIndex?.(-1);

      if (loopCount === Infinity || loopsDone < loopCount) {
        const delay = isIOS() ? 250 : 50;
        window.setTimeout(() => speakOnce(), delay);
      } else {
        callbacks.onPlayingChange?.(false);
      }
    };

    utterance.onerror = (event) => {
      if (stopped || event.error === 'interrupted') return;
      callbacks.onPlayingChange?.(false);
      callbacks.onError?.(
        event.error === 'not-allowed'
          ? '音声再生がブロックされました。もう一度▶をタップしてください'
          : `音声エラー: ${event.error}`,
      );
    };

    const start = () => window.speechSynthesis.speak(utterance);

    // iOS: speak must happen soon after user gesture; small delay helps voice loading
    if (isIOS()) {
      window.setTimeout(start, 50);
    } else {
      start();
    }

    // Fallback if onstart never fires (common iOS bug)
    window.setTimeout(() => {
      if (!stopped && !started) {
        window.speechSynthesis.cancel();
        start();
      }
    }, 500);
  };

  warmUpSpeechSynthesis();

  let hasStarted = false;
  const startOnce = () => {
    if (hasStarted || stopped) return;
    hasStarted = true;
    speakOnce();
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    const onVoices = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
      startOnce();
    };
    window.speechSynthesis.addEventListener('voiceschanged', onVoices);
    window.setTimeout(startOnce, 150);
  } else {
    startOnce();
  }

  return { engine: 'webspeech', stop, togglePause };
}
