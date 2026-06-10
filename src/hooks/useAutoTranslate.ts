import { useCallback, useEffect, useRef, useState } from 'react';
import { translatePhrase } from '../services/translate';
import type { Language } from '../types';

const DEBOUNCE_MS = 600;

function formatTranslateError(message: string): string {
  if (message.toLowerCase().includes('quota') || message.includes('上限')) {
    return '翻訳の利用上限に達しました。しばらく待ってください。';
  }
  return '翻訳できませんでした。しばらくしてからお試しください。';
}

export function useAutoTranslate(text: string, language: Language) {
  const [translation, setTranslation] = useState('');
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const requestId = useRef(0);

  const setTranslationDirect = useCallback((value: string) => {
    requestId.current += 1;
    setTranslating(false);
    setTranslateError(null);
    setTranslation(value);
  }, []);

  useEffect(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      setTranslation('');
      setTranslating(false);
      setTranslateError(null);
      return;
    }

    const timer = window.setTimeout(() => {
      const id = ++requestId.current;
      setTranslating(true);
      setTranslateError(null);

      void translatePhrase(trimmed, language)
        .then((result) => {
          if (id !== requestId.current) return;
          setTranslation(result);
          setTranslateError(null);
        })
        .catch((e) => {
          if (id !== requestId.current) return;
          const message = e instanceof Error ? e.message : 'Translation error';
          setTranslateError(formatTranslateError(message));
        })
        .finally(() => {
          if (id === requestId.current) setTranslating(false);
        });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [text, language]);

  return {
    translation,
    translating,
    translateError,
    setTranslation: setTranslationDirect,
  };
}
