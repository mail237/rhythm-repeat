import { useMemo, useState } from 'react';
import type { Language, Phrase } from '../types';
import { PhraseCard } from './PhraseCard';

interface Props {
  phrases: Phrase[];
  totalPlays: number;
  todayPlays: number;
  onPractice: (phrase: Phrase) => void;
  onDelete: (id: string) => void;
}

type Filter = 'all' | Language;

export function PhraseLibrary({
  phrases,
  totalPlays,
  todayPlays,
  onPractice,
  onDelete,
}: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return phrases.filter((p) => {
      if (filter !== 'all' && p.language !== filter) return false;
      if (search && !p.text.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [phrases, filter, search]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-violet-400">{phrases.length}</p>
          <p className="text-xs text-gray-500 mt-1">総フレーズ数</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-2xl font-bold">{totalPlays}</p>
          <p className="text-xs text-gray-500 mt-1">総再生回数</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-2xl font-bold">{todayPlays}</p>
          <p className="text-xs text-gray-500 mt-1">今日の練習</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 p-1 bg-gray-900 rounded-xl border border-gray-800">
          {(
            [
              ['all', 'All'],
              ['en', '🇺🇸 EN'],
              ['de', '🇩🇪 DE'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === key
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="フレーズを検索..."
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-12">
          {phrases.length === 0
            ? 'まだフレーズが保存されていません'
            : '該当するフレーズがありません'}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((phrase) => (
            <PhraseCard
              key={phrase.id}
              phrase={phrase}
              onPractice={onPractice}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
