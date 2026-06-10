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

function formatServerTtsError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('quota') || lower.includes('429') || lower.includes('resource_exhausted')) {
    return '音声の利用上限に達しました。しばらく待ってからもう一度お試しください。';
  }
  return message;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return errorResponse('GEMINI_API_KEY is not configured on the server', 500);
  }

  try {
    const body = await readJsonBody<TTSRequestBody>(request);
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
  } catch (e) {
    const message = e instanceof Error ? e.message : 'TTS proxy error';
    return errorResponse(formatServerTtsError(message), 500);
  }
}
