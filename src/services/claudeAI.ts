import { API_BASE } from '../config/api';
import type { Language, SuggestedPhrase } from '../types';

const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  de: 'German',
};

interface ClaudeResponse {
  content: { type: string; text: string }[];
}

export async function suggestPhrases(
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

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string } }).error?.message ??
        `Claude API error: ${response.status}`,
    );
  }

  const data = (await response.json()) as ClaudeResponse;
  const text = data.content.find((c) => c.type === 'text')?.text ?? '';

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI response was not valid JSON');
  }

  const parsed = JSON.parse(jsonMatch[0]) as { phrases: SuggestedPhrase[] };
  return parsed.phrases;
}
