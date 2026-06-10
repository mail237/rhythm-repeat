import { useCallback, useEffect, useRef, useState } from 'react';
import { translatePhrase } from '../services/translate';
import type { Language } from '../types';

const DEBOUNCE_MS = 600;

export function useAutoTranslate(text: string, language: Language) {
  const [translation, setTranslation] = useState('');
  const [translating, setTranslating] = useState(false);
  const requestId = useRef(0);

  const setTranslationDirect = useCallback((value: string) => {
    requestId.current += 1;
    setTranslating(false);
    setTranslation(value);
  }, []);

  useEffect(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      setTranslation('');
      setTranslating(false);
      return;
    }

    const timer = window.setTimeout(() => {
      const id = ++requestId.current;
      setTranslating(true);

      void translatePhrase(trimmed, language)
        .then((result) => {
          if (id !== requestId.current) return;
          setTranslation(result);
        })
        .catch(() => {
          if (id !== requestId.current) return;
        })
        .finally(() => {
          if (id === requestId.current) setTranslating(false);
        });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [text, language]);

  return { translation, translating, setTranslation: setTranslationDirect };
}
