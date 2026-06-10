import { API_BASE } from '../config/api';
import type { Language } from '../types';
import { LANGUAGE_CONFIG } from '../types';

const cache = new Map<string, string>();

function cacheKey(text: string, language: Language): string {
  return `${language}:${text.trim().toLowerCase()}`;
}

function parseError(data: unknown, fallback: string): string {
  return (
    (data as { error?: { message?: string } }).error?.message ?? fallback
  );
}

export async function translatePhrase(
  text: string,
  language: Language,
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return '';

  const key = cacheKey(trimmed, language);
  const cached = cache.get(key);
  if (cached) return cached;

  const response = await fetch(`${API_BASE}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: trimmed,
      languageLabel: LANGUAGE_CONFIG[language].label,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(parseError(data, `Translation error: ${response.status}`));
  }

  const translation = (data as { translation: string }).translation.trim();
  cache.set(key, translation);
  return translation;
}
