import { API_BASE } from '../config/api';
import type { Language, SuggestedPhrase } from '../types';

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

const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  de: 'German',
};

interface ClaudeResponse {
  content: { type: string; text: string }[];
}

function parseError(data: unknown, fallback: string): string {
  return (
    (data as { error?: { message?: string } }).error?.message ?? fallback
  );
}

function parsePhrases(data: ClaudeResponse): SuggestedPhrase[] {
  const text = data.content.find((c) => c.type === 'text')?.text ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI response was not valid JSON');
  }
  const parsed = JSON.parse(jsonMatch[0]) as { phrases: SuggestedPhrase[] };
  return parsed.phrases;
}

async function suggestDirect(
  userInput: string,
  language: Language,
  apiKey: string,
): Promise<SuggestedPhrase[]> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `言語: ${LANGUAGE_LABELS[language]}\nユーザーのリクエスト: ${userInput}`,
        },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(parseError(data, `Claude API error: ${response.status}`));
  }
  return parsePhrases(data as ClaudeResponse);
}

async function suggestViaProxy(
  userInput: string,
  language: Language,
): Promise<SuggestedPhrase[]> {
  const response = await fetch(`${API_BASE}/claude`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userInput,
      languageLabel: LANGUAGE_LABELS[language],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(parseError(data, `Claude proxy error: ${response.status}`));
  }
  return parsePhrases(data as ClaudeResponse);
}

export async function suggestPhrases(
  userInput: string,
  language: Language,
  clientApiKey?: string,
): Promise<SuggestedPhrase[]> {
  if (clientApiKey) {
    return suggestDirect(userInput, language, clientApiKey);
  }

  try {
    return await suggestViaProxy(userInput, language);
  } catch (proxyErr) {
    throw new Error(
      `${proxyErr instanceof Error ? proxyErr.message : 'AI error'} — 設定（⚙️）から Anthropic APIキーを入力してください`,
    );
  }
}
