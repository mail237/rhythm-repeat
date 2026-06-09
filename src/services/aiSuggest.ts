import { API_BASE } from '../config/api';
import type { Language, SuggestedPhrase } from '../types';

const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  de: 'German',
};

function parseError(data: unknown, fallback: string): string {
  return (
    (data as { error?: { message?: string } }).error?.message ?? fallback
  );
}

export async function suggestPhrases(
  userInput: string,
  language: Language,
  clientApiKey?: string,
): Promise<SuggestedPhrase[]> {
  // Legacy: direct Anthropic from device if user entered key in settings
  if (clientApiKey?.startsWith('sk-ant')) {
    const { suggestPhrases: claudeDirect } = await import('./claudeAI');
    return claudeDirect(userInput, language, clientApiKey);
  }

  const response = await fetch(`${API_BASE}/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userInput,
      languageLabel: LANGUAGE_LABELS[language],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(parseError(data, `AI suggest error: ${response.status}`));
  }

  return (data as { phrases: SuggestedPhrase[] }).phrases;
}
