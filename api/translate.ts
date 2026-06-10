/// <reference types="node" />
import { errorResponse, jsonResponse, readJsonBody } from './_shared.js';
import {
  translateWithGemini,
  type TranslateRequestBody,
} from './_translateGemini.js';

export const config = { runtime: 'edge' };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return errorResponse('GEMINI_API_KEY is not configured on the server', 500);
  }

  try {
    const body = await readJsonBody<TranslateRequestBody>(request);
    if (!body.text?.trim()) {
      return errorResponse('text is required', 400);
    }

    const result = await translateWithGemini(geminiKey, body);
    return jsonResponse(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Translation error';
    return errorResponse(message, 500);
  }
}
