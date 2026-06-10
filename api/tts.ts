/// <reference types="node" />
import { errorResponse, jsonResponse, readJsonBody } from './_shared.js';
import { synthesizeWithGemini } from './_geminiTts.js';

export const config = { runtime: 'edge' };

interface TTSRequestBody {
  text: string;
  languageCode: string;
  voiceName: string;
  speed: number;
}

async function synthesizeWithCloudTts(
  apiKey: string,
  body: TTSRequestBody,
): Promise<Response> {
  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: body.text },
        voice: { languageCode: body.languageCode, name: body.voiceName },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: body.speed,
          pitch: 0,
          enableTimePointing: ['WORD'],
        },
      }),
    },
  );

  const data = await response.json();
  return jsonResponse(data, response.status);
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const cloudKey = process.env.GOOGLE_TTS_API_KEY;

  if (!geminiKey && !cloudKey) {
    return errorResponse(
      'GEMINI_API_KEY or GOOGLE_TTS_API_KEY is not configured on the server',
      500,
    );
  }

  try {
    const body = await readJsonBody<TTSRequestBody>(request);

    if (geminiKey) {
      try {
        const result = await synthesizeWithGemini(
          geminiKey,
          body.text,
          body.languageCode,
        );
        return jsonResponse({
          audioContent: result.audioContent,
          mimeType: result.mimeType,
          timepoints: [],
        });
      } catch (geminiErr) {
        if (!cloudKey) throw geminiErr;
      }
    }

    if (cloudKey) {
      return synthesizeWithCloudTts(cloudKey, body);
    }

    return errorResponse('TTS failed', 500);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'TTS proxy error';
    return errorResponse(message, 500);
  }
}
