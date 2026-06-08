import { useCallback, useEffect, useState } from 'react';
import type { Language, Phrase } from '../types';

const PHRASES_KEY = 'rr_phrases';

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadPhrases(): Phrase[] {
  try {
    const raw = localStorage.getItem(PHRASES_KEY);
    if (!raw) return [];
    const phrases = JSON.parse(raw) as Phrase[];
    const today = todayString();
    return phrases.map((p) => {
      const lastDay = p.stats.lastPracticedAt?.slice(0, 10);
      if (lastDay !== today && p.stats.todayPlays > 0) {
        return { ...p, stats: { ...p.stats, todayPlays: 0 } };
      }
      return p;
    });
  } catch {
    return [];
  }
}

function savePhrases(phrases: Phrase[]): void {
  localStorage.setItem(PHRASES_KEY, JSON.stringify(phrases));
}

function computeStreak(lastPracticedAt: string, currentStreak: number): number {
  const today = todayString();
  const lastDay = lastPracticedAt.slice(0, 10);
  if (lastDay === today) return currentStreak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (lastDay === yesterdayStr) return currentStreak + 1;
  return 1;
}

export function usePhraseStore() {
  const [phrases, setPhrases] = useState<Phrase[]>(loadPhrases);

  useEffect(() => {
    savePhrases(phrases);
  }, [phrases]);

  const addPhrase = useCallback(
    (
      text: string,
      language: Language,
      meta?: { translation?: string; context?: string },
    ): Phrase => {
      const phrase: Phrase = {
        id: crypto.randomUUID(),
        text,
        language,
        translation: meta?.translation,
        context: meta?.context,
        createdAt: new Date().toISOString(),
        stats: {
          totalPlays: 0,
          todayPlays: 0,
          lastPracticedAt: '',
          streak: 0,
        },
      };
      setPhrases((prev) => [phrase, ...prev]);
      return phrase;
    },
    [],
  );

  const deletePhrase = useCallback((id: string) => {
    setPhrases((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const recordPlay = useCallback((id: string) => {
    const now = new Date().toISOString();
    const today = todayString();

    setPhrases((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const lastDay = p.stats.lastPracticedAt?.slice(0, 10);
        const streak =
          lastDay === today
            ? p.stats.streak
            : computeStreak(p.stats.lastPracticedAt || now, p.stats.streak);
        return {
          ...p,
          stats: {
            totalPlays: p.stats.totalPlays + 1,
            todayPlays: p.stats.todayPlays + 1,
            lastPracticedAt: now,
            streak,
          },
        };
      }),
    );
  }, []);

  const getPhrase = useCallback(
    (id: string) => phrases.find((p) => p.id === id),
    [phrases],
  );

  const totalPlays = phrases.reduce((sum, p) => sum + p.stats.totalPlays, 0);
  const todayPlays = phrases.reduce((sum, p) => sum + p.stats.todayPlays, 0);

  return {
    phrases,
    addPhrase,
    deletePhrase,
    recordPlay,
    getPhrase,
    totalPlays,
    todayPlays,
  };
}
