import { useMemo, useState } from 'react';
import {
  COVERAGE_TOP_20,
  LOOP_TOP_100,
  TOP_100_TEMPLATES,
  TEMPLATE_FAMILIES,
} from '../data/templates';
import type { PhraseTemplateFull, TemplateFamily } from '../data/templates/types';
import {
  templateExampleCount,
  toFullTemplatePracticeText,
  toPracticePhrase,
} from '../utils/templatePractice';

interface Props {
  onPractice: (text: string, translation: string) => void;
}

type ListMode = 'loop' | 'top20' | 'all';

export function TemplateLibrary({ onPractice }: Props) {
  const [mode, setMode] = useState<ListMode>('loop');
  const [family, setFamily] = useState<TemplateFamily | 'all'>('all');
  const [search, setSearch] = useState('');

  const baseList = useMemo(() => {
    if (mode === 'loop') return LOOP_TOP_100;
    if (mode === 'top20') return COVERAGE_TOP_20;
    return [...TOP_100_TEMPLATES].sort((a, b) => a.rank - b.rank);
  }, [mode]);

  const filtered = useMemo(() => {
    return baseList.filter((t) => {
      if (family !== 'all' && t.family !== family) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        t.template.toLowerCase().includes(q) ||
        t.translation.includes(search) ||
        t.category.includes(search)
      );
    });
  }, [baseList, family, search]);

  const handlePractice = (t: PhraseTemplateFull) => {
    const count = templateExampleCount(t);
    const translation =
      count > 1 ? `${t.translation}（${count}例を連続ループ）` : t.translation;
    onPractice(toFullTemplatePracticeText(t), translation);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-violet-950/40 border border-violet-800/50 rounded-xl p-4">
        <h2 className="font-semibold text-violet-200 mb-1">📐 フレーズ型テンプレート</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          ネイティブがよく使う「型」を選んで練習します。タップすると練習画面へ移動し、▶
          で再生すると、同じ型の例文を全文まとめてループします。まずは「ループTOP」から。
        </p>
      </div>

      <div className="flex gap-1 p-1 bg-gray-900 rounded-xl border border-gray-800">
        {(
          [
            ['loop', 'ループTOP'],
            ['top20', '頻出TOP20'],
            ['all', '全100'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              mode === key
                ? 'bg-violet-600 text-white'
                : 'text-gray-500 hover:text-gray-300'
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
        placeholder="検索（例: think, 意見, depends）"
        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
      />

      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setFamily('all')}
          className={`px-3 py-1 rounded-full text-xs ${
            family === 'all'
              ? 'bg-violet-600 text-white'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          すべて
        </button>
        {TEMPLATE_FAMILIES.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFamily(f.id)}
            className={`px-3 py-1 rounded-full text-xs ${
              family === f.id
                ? 'bg-violet-600 text-white'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            {f.id}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500">{filtered.length} 件</p>

      <div className="flex flex-col gap-3">
        {filtered.map((t) => (
          <TemplateCard key={t.id} template={t} onPractice={() => handlePractice(t)} />
        ))}
      </div>
    </div>
  );
}

function TemplateCard({
  template: t,
  onPractice,
}: {
  template: PhraseTemplateFull;
  onPractice: () => void;
}) {
  const example = toPracticePhrase(t);
  const exampleCount = templateExampleCount(t);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-base leading-snug">{t.template}</p>
          <p className="text-sm text-gray-400 mt-0.5">{t.translation}</p>
        </div>
        <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-500">
          {t.family}
        </span>
      </div>

      <p className="text-xs text-gray-500">
        {exampleCount > 1 ? `${exampleCount}例を連続再生 · ` : '例: '}
        <span className="text-gray-300">{example}</span>
        {exampleCount > 1 && (
          <span className="text-gray-600"> ほか{exampleCount - 1}文</span>
        )}
      </p>

      <div className="flex items-center justify-between gap-2 pt-1">
        <span className="text-[10px] text-gray-600">
          {t.category} · 頻出{t.frequency} · ループ{t.loopFit}
        </span>
        <button
          type="button"
          onClick={onPractice}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-medium"
        >
          練習する →
        </button>
      </div>
    </div>
  );
}
