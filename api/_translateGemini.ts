const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
] as const;

export interface TranslateRequestBody {
  text: string;
  languageLabel: string;
}

function buildPrompt(body: TranslateRequestBody): string {
  return `Translate this ${body.languageLabel} phrase into natural Japanese for language learners.
Keep the tone (casual/neutral/formal) of the original.
Reply with only the Japanese translation. No quotes, labels, or explanation.

Phrase: ${body.text}`;
}

export function parseTranslationText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Empty translation');
  }

  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (codeBlock?.[1] ?? trimmed).trim();

  const jsonMatch = candidate.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as { translation?: string };
      const fromJson = parsed.translation?.trim();
      if (fromJson) return fromJson;
    } catch {
      // fall through to plain text
    }
  }

  const plain = candidate
    .replace(/^["'「]|["'」]$/g, '')
    .replace(/^translation\s*[:：]\s*/i, '')
    .trim();

  if (plain) return plain;
  throw new Error('Invalid translation response');
}

export async function translateWithGemini(
  apiKey: string,
  body: TranslateRequestBody,
): Promise<{ translation: string }> {
  const prompt = buildPrompt(body);
  let lastError = '翻訳に失敗しました';

  for (const model of GEMINI_MODELS) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
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
    try {
      return { translation: parseTranslationText(text) };
    } catch {
      lastError = '翻訳の解析に失敗しました';
      continue;
    }
  }

  if (lastError.toLowerCase().includes('quota') || lastError.includes('429')) {
    throw new Error('翻訳の利用上限に達しました。しばらく待ってからお試しください。');
  }

  throw new Error(lastError);
}
