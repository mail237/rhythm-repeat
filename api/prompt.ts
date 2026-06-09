export const PHRASE_SUGGEST_SYSTEM_PROMPT = `You are a language coach specializing in natural, colloquial expressions.
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

export interface SuggestRequestBody {
  userInput: string;
  languageLabel: string;
}

export interface PhraseJson {
  text: string;
  translation: string;
  context: string;
  register: 'casual' | 'neutral' | 'formal';
}

export function parsePhrasesJson(text: string): PhraseJson[] {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI response was not valid JSON');
  }
  const parsed = JSON.parse(jsonMatch[0]) as { phrases: PhraseJson[] };
  if (!Array.isArray(parsed.phrases) || parsed.phrases.length === 0) {
    throw new Error('AI returned no phrases');
  }
  return parsed.phrases;
}

export function buildUserPrompt(body: SuggestRequestBody): string {
  return `言語: ${body.languageLabel}\nユーザーのリクエスト: ${body.userInput}`;
}
