import { useState } from 'react';
import { suggestPhrases } from '../services/claudeAI';
import type { Language, SuggestedPhrase } from '../types';
import { LANGUAGE_CONFIG } from '../types';

interface Props {
  open: boolean;
  language: Language;
  anthropicApiKey: string;
  onClose: () => void;
  onSelect: (phrase: SuggestedPhrase) => void;
  onPreview: (text: string) => void;
}

export function AISuggestModal({
  open,
  language,
  anthropicApiKey,
  onClose,
  onSelect,
  onPreview,
}: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedPhrase[]>([]);

  if (!open) return null;

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const phrases = await suggestPhrases(
        input,
        language,
        anthropicApiKey || undefined,
      );
      setSuggestions(phrases);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const registerColors: Record<string, string> = {
    casual: 'bg-green-900/40 text-green-400',
    neutral: 'bg-blue-900/40 text-blue-400',
    formal: 'bg-purple-900/40 text-purple-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="閉じる"
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-lg font-semibold mb-1">✨ AIフレーズ提案</h2>
        <p className="text-sm text-gray-500 mb-4">
          {LANGUAGE_CONFIG[language].flag} {LANGUAGE_CONFIG[language].label}
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="日本語でOK！例:「カジュアルに『疲れた』って言いたい」"
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 mb-3"
        />

        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={loading || !input.trim()}
          className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 font-medium text-sm mb-4 transition-colors"
        >
          {loading ? '生成中...' : 'フレーズを生成'}
        </button>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <div className="flex flex-col gap-3">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-semibold text-lg">{s.text}</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${registerColors[s.register] ?? 'bg-gray-700 text-gray-400'}`}
                >
                  {s.register}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-1">{s.translation}</p>
              <p className="text-gray-500 text-xs mb-3">{s.context}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onPreview(s.text)}
                  className="flex-1 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm transition-colors"
                >
                  ▶ 試し聴き
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(s);
                    onClose();
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm transition-colors"
                >
                  ✅ これを練習する
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
