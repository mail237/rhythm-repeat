import { errorResponse, jsonResponse, readJsonBody } from './_shared';

export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `You are a language coach specializing in natural, colloquial expressions.
The user will describe in Japanese what they want to say or a situation they're in.
Generate 3-5 natural, colloquial phrases in the target language (English or German).

Respond ONLY in JSON format:
{
  "phrases": [
    {
      "text": "phrase in target language",
      "translation": "日本語訳",
      "context": "どんな場面で使うか（日本語で1〜2文）",
      "register": "casual | neutral | formal"
    }
  ]
}`;

interface ClaudeRequestBody {
  userInput: string;
  languageLabel: string;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return errorResponse('ANTHROPIC_API_KEY is not configured on the server', 500);
  }

  try {
    const { userInput, languageLabel } =
      await readJsonBody<ClaudeRequestBody>(request);

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
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `言語: ${languageLabel}\nユーザーのリクエスト: ${userInput}`,
          },
        ],
      }),
    });

    const data = await response.json();
    return jsonResponse(data, response.status);
  } catch {
    return errorResponse('Claude proxy error', 500);
  }
}
