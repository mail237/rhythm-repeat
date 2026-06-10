import { API_BASE } from '../config/api';
import type { Language } from '../types';
import { LANGUAGE_CONFIG } from '../types';

const CACHE_KEY = 'rr_translate_cache';
const memoryCache = new Map<string, string>();

function readDiskCache(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeDiskCache(cache: Record<string, string>): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

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
  const cached = memoryCache.get(key) ?? readDiskCache()[key];
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
  memoryCache.set(key, translation);
  const disk = readDiskCache();
  disk[key] = translation;
  writeDiskCache(disk);
  return translation;
}
