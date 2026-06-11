import type { PhraseTemplateCompact, PhraseTemplateFull } from './types';
import { TOP_100_TEMPLATES } from './top100';
import catalog901 from './catalog901.json';
import { COVERAGE_TARGETS, TEMPLATE_FAMILIES } from './families';

export { COVERAGE_TARGETS, TEMPLATE_FAMILIES };
export { TOP_100_TEMPLATES };
export type { PhraseTemplateCompact, PhraseTemplateFull };

export const CATALOG_101_PLUS = catalog901 as PhraseTemplateCompact[];

/** 全1000（TOP100完全版 + 101以降コンパクト版） */
export function getAllTemplatesCompact(): PhraseTemplateCompact[] {
  const top100Compact: PhraseTemplateCompact[] = TOP_100_TEMPLATES.map(
    ({ id, rank, category, family, template, translation, frequency, applicability, beginnerFit, loopFit }) => ({
      id,
      rank,
      category,
      family,
      template,
      translation,
      frequency,
      applicability,
      beginnerFit,
      loopFit,
    }),
  );
  return [...top100Compact, ...CATALOG_101_PLUS].sort((a, b) => a.rank - b.rank);
}

export function getTemplateById(id: string): PhraseTemplateFull | PhraseTemplateCompact | undefined {
  const full = TOP_100_TEMPLATES.find((t) => t.id === id);
  if (full) return full;
  return CATALOG_101_PLUS.find((t) => t.id === id);
}

/** 音声ループ学習スコア = loopFit × frequency × applicability */
export function loopScore(t: {
  loopFit: number;
  frequency: number;
  applicability: number;
}): number {
  return t.loopFit * t.frequency * t.applicability;
}

/** 音声ループ学習に最適な TOP100（TOP_100_TEMPLATES から選出） */
export const LOOP_TOP_100: PhraseTemplateFull[] = [...TOP_100_TEMPLATES].sort(
  (a, b) => loopScore(b) - loopScore(a),
);

/** 会話カバレッジ上位20（頻度順 rank） */
export const COVERAGE_TOP_20: PhraseTemplateFull[] = [...TOP_100_TEMPLATES]
  .sort((a, b) => a.rank - b.rank)
  .slice(0, 20);
