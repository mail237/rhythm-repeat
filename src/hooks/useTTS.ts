import { useCallback, useRef, useState } from 'react';
import { synthesizeSpeech, base64ToAudioUrl } from '../services/googleTTS';
import type { Language, Timepoint, TTSResult } from '../types';

export function useTTS(
  googleApiKey?: string,
  onCharUsed?: (chars: number) => void,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const fetchAudio = useCallback(
    async (
      text: string,
      language: Language,
      speed: number,
    ): Promise<TTSResult & { audioUrl: string }> => {
      if (!text.trim()) {
        throw new Error('フレーズを入力してください');
      }

      setLoading(true);
      setError(null);

      try {
        const result = await synthesizeSpeech(
          text,
          language,
          speed,
          googleApiKey || undefined,
        );
        cleanup();
        const audioUrl = base64ToAudioUrl(
          result.audioContent,
          result.mimeType ?? 'audio/mp3',
        );
        audioUrlRef.current = audioUrl;

        if (!result.fromCache && onCharUsed) {
          onCharUsed(text.length);
        }

        return { ...result, audioUrl };
      } catch (e) {
        const message = e instanceof Error ? e.message : 'TTS error';
        setError(message);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [googleApiKey, cleanup, onCharUsed],
  );

  return { fetchAudio, loading, error, cleanup, setError };
}

export type { Timepoint };
