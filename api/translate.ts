/// <reference types="node" />
import { errorResponse, jsonResponse, readJsonBody } from './_shared.js';

export const config = { runtime: 'edge' };

const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
] as const;

interface TranslateRequestBody {
  text: string;
  languageLabel: string;
}

function buildPrompt(body: TranslateRequestBody): string {
  return `Translate this ${body.languageLabel} phrase into natural Japanese suitable for language learners.
Keep the tone (casual/neutral/formal) of the original.
Return ONLY JSON: {"translation":"日本語訳"}

Phrase: ${body.text}`;
}

function parseTranslation(text: string): string {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid translation JSON');
  }
  const parsed = JSON.parse(jsonMatch[0]) as { translation?: string };
  const translation = parsed.translation?.trim();
  if (!translation) {
    throw new Error('Empty translation');
  }
  return translation;
}

async function translateWithGemini(
  apiKey: string,
  body: TranslateRequestBody,
): Promise<{ translation: string }> {
  const prompt = buildPrompt(body);
  let lastError = 'Gemini API error';

  for (const model of GEMINI_MODELS) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
            maxOutputTokens: 256,
          },
        }),
      },
    );

    const data = (await response.json()) as {
      error?: { message?: string };
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    if (!response.ok) {
      lastError = data.error?.message ?? `Gemini error ${response.status}`;
      if ([404, 429, 503].includes(response.status)) continue;
      throw new Error(lastError);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return { translation: parseTranslation(text) };
  }

  throw new Error(lastError);
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  const geminiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_TTS_API_KEY;
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
