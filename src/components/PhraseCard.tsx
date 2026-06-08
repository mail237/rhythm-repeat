import type { Phrase } from '../types';
import { LANGUAGE_CONFIG } from '../types';

interface Props {
  phrase: Phrase;
  onPractice: (phrase: Phrase) => void;
  onDelete: (id: string) => void;
}

function formatDate(iso: string): string {
  if (!iso) return '未練習';
  return new Date(iso).toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
  });
}

export function PhraseCard({ phrase, onPractice, onDelete }: Props) {
  const config = LANGUAGE_CONFIG[phrase.language];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-lg leading-snug">{phrase.text}</p>
        <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
          {config.flag} {config.label}
        </span>
      </div>

      {phrase.translation && (
        <p className="text-sm text-gray-500">{phrase.translation}</p>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <span>🔁 {phrase.stats.totalPlays}回</span>
        <span>📅 {formatDate(phrase.stats.lastPracticedAt)}</span>
        {phrase.stats.streak > 0 && (
          <span>🔥 {phrase.stats.streak}日連続</span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPractice(phrase)}
          className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium transition-colors"
        >
          ▶ 練習する
        </button>
        <button
          type="button"
          onClick={() => onDelete(phrase.id)}
          className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-red-900/40 text-sm transition-colors"
          aria-label="削除"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
