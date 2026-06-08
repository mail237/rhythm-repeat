import { API_BASE } from '../config/api';
import { hashText } from '../utils/hash';
import type { Language, TTSResult, Timepoint } from '../types';
import { LANGUAGE_CONFIG } from '../types';

interface CacheEntry {
  audioContent: string;
  timepoints: Timepoint[];
}

function getCacheKey(lang: Language, speed: number, textHash: string): string {
  return `tts_cache_${lang}_${speed}_${textHash}`;
}

function readCache(key: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry;
  } catch {
    return null;
  }
}

function writeCache(key: string, entry: CacheEntry): void {
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage full — ignore
  }
}

interface SynthesizeResponse {
  audioContent: string;
  timepoints?: Timepoint[];
}

export async function synthesizeSpeech(
  text: string,
  language: Language,
  speed: number,
): Promise<TTSResult> {
  const textHash = await hashText(text);
  const cacheKey = getCacheKey(language, speed, textHash);
  const cached = readCache(cacheKey);

  if (cached) {
    return { ...cached, fromCache: true };
  }

  const config = LANGUAGE_CONFIG[language];
  const response = await fetch(`${API_BASE}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      languageCode: config.languageCode,
      voiceName: config.voiceName,
      speed,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string } }).error?.message ??
        `TTS API error: ${response.status}`,
    );
  }

  const data = (await response.json()) as SynthesizeResponse;
  const timepoints = data.timepoints ?? [];
  const entry: CacheEntry = {
    audioContent: data.audioContent,
    timepoints,
  };

  writeCache(cacheKey, entry);
  return { ...entry, fromCache: false };
}

export function base64ToAudioUrl(base64: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'audio/mp3' });
  return URL.createObjectURL(blob);
}
