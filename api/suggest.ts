/// <reference types="node" />
import { errorResponse, jsonResponse, readJsonBody } from './_shared.js';
import {
  PHRASE_SUGGEST_SYSTEM_PROMPT,
  buildUserPrompt,
  parsePhrasesJson,
  type SuggestRequestBody,
} from './prompt.js';

export const config = { runtime: 'edge' };

const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
] as const;

async function suggestWithGemini(
  apiKey: string,
  body: SuggestRequestBody,
): Promise<{ phrases: ReturnType<typeof parsePhrasesJson> }> {
  const prompt = `${PHRASE_SUGGEST_SYSTEM_PROMPT}\n\n${buildUserPrompt(body)}`;
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
            temperature: 0.7,
            maxOutputTokens: 1200,
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
      if (response.status === 404 || response.status === 429) continue;
      throw new Error(lastError);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return { phrases: parsePhrasesJson(text) };
  }

  throw new Error(lastError);
}

async function suggestWithClaude(
  apiKey: string,
  body: SuggestRequestBody,
): Promise<{ phrases: ReturnType<typeof parsePhrasesJson> }> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: PHRASE_SUGGEST_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(body) }],
    }),
  });

  const data = (await response.json()) as {
    error?: { message?: string };
    content?: { type: string; text: string }[];
  };

  if (!response.ok) {
    throw new Error(data.error?.message ?? `Claude error ${response.status}`);
  }

  const text = data.content?.find((c) => c.type === 'text')?.text ?? '';
  return { phrases: parsePhrasesJson(text) };
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  const geminiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_TTS_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!geminiKey && !anthropicKey) {
    return errorResponse(
      'GEMINI_API_KEY or ANTHROPIC_API_KEY is not configured on the server',
      500,
    );
  }

  try {
    const body = await readJsonBody<SuggestRequestBody>(request);

    if (geminiKey) {
      try {
        const result = await suggestWithGemini(geminiKey, body);
        return jsonResponse(result);
      } catch (geminiErr) {
        if (!anthropicKey) throw geminiErr;
      }
    }

    if (anthropicKey) {
      const result = await suggestWithClaude(anthropicKey, body);
      return jsonResponse(result);
    }

    return errorResponse('AI suggest failed', 500);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'AI suggest error';
    return errorResponse(message, 500);
  }
}
