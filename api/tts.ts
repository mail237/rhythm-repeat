/// <reference types="node" />
import { errorResponse, jsonResponse, readJsonBody } from './_shared.js';

export const config = { runtime: 'edge' };

interface TTSRequestBody {
  text: string;
  languageCode: string;
  voiceName: string;
  speed: number;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    return errorResponse('GOOGLE_TTS_API_KEY is not configured on the server', 500);
  }

  try {
    const { text, languageCode, voiceName, speed } =
      await readJsonBody<TTSRequestBody>(request);

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode, name: voiceName },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: speed,
            pitch: 0,
            enableTimePointing: ['WORD'],
          },
        }),
      },
    );

    const data = await response.json();
    return jsonResponse(data, response.status);
  } catch {
    return errorResponse('TTS proxy error', 500);
  }
}
