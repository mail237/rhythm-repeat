const GEMINI_TTS_MODELS = [
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-pro-preview-tts',
] as const;

const VOICE_BY_LANG: Record<string, string> = {
  'en-US': 'Kore',
  'de-DE': 'Charon',
};

function writeString(view: DataView, offset: number, value: string): void {
  for (let i = 0; i < value.length; i++) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

export function pcmBase64ToWavBase64(
  pcmBase64: string,
  sampleRate = 24000,
): string {
  const pcmBinary = atob(pcmBase64);
  const pcmBytes = new Uint8Array(pcmBinary.length);
  for (let i = 0; i < pcmBinary.length; i++) {
    pcmBytes[i] = pcmBinary.charCodeAt(i);
  }

  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBytes.length;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const wav = new Uint8Array(44 + dataSize);
  wav.set(new Uint8Array(header), 0);
  wav.set(pcmBytes, 44);

  let binary = '';
  for (let i = 0; i < wav.length; i++) {
    binary += String.fromCharCode(wav[i]!);
  }
  return btoa(binary);
}

function languageHint(languageCode: string): string {
  if (languageCode.startsWith('de')) return 'German';
  return 'English';
}

export async function synthesizeWithGemini(
  apiKey: string,
  text: string,
  languageCode: string,
): Promise<{ audioContent: string; mimeType: string }> {
  const voiceName = VOICE_BY_LANG[languageCode] ?? 'Kore';
  const prompt = `Say naturally in ${languageHint(languageCode)}: ${text}`;
  let lastError = 'Gemini TTS error';

  for (const model of GEMINI_TTS_MODELS) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
          },
        }),
      },
    );

    const data = (await response.json()) as {
      error?: { message?: string };
      candidates?: {
        content?: {
          parts?: { inlineData?: { mimeType?: string; data?: string } }[];
        };
      }[];
    };

    if (!response.ok) {
      lastError = data.error?.message ?? `Gemini TTS ${response.status}`;
      if ([404, 429, 503].includes(response.status)) continue;
      throw new Error(lastError);
    }

    const inline = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!inline?.data) {
      lastError = 'Gemini TTS returned no audio';
      continue;
    }

    return {
      audioContent: pcmBase64ToWavBase64(inline.data),
      mimeType: 'audio/wav',
    };
  }

  throw new Error(lastError);
}
