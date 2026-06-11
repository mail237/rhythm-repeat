import type { PhraseTemplateCompact, PhraseTemplateFull } from '../data/templates/types';

export function isFullTemplate(
  t: PhraseTemplateCompact | PhraseTemplateFull,
): t is PhraseTemplateFull {
  return 'derivatives' in t;
}

/** カード表示用の代表例（1文） */
export function toPracticePhrase(
  t: PhraseTemplateCompact | PhraseTemplateFull,
): string {
  if (isFullTemplate(t) && t.derivatives[0]) {
    return t.derivatives[0];
  }
  if (isFullTemplate(t) && t.slotExamples[0]) {
    return t.template.replace('___', t.slotExamples[0]);
  }
  return t.template;
}

/** 型の全派生例を改行区切りで返す（連続ループ再生用） */
export function toFullTemplatePracticeText(
  t: PhraseTemplateCompact | PhraseTemplateFull,
): string {
  if (isFullTemplate(t) && t.derivatives.length > 0) {
    return t.derivatives.join('\n');
  }
  if (isFullTemplate(t) && t.slotExamples.length > 0) {
    return t.slotExamples
      .map((ex) => t.template.replace('___', ex))
      .join('\n');
  }
  return t.template;
}

export function templateExampleCount(
  t: PhraseTemplateCompact | PhraseTemplateFull,
): number {
  if (isFullTemplate(t) && t.derivatives.length > 0) {
    return t.derivatives.length;
  }
  if (isFullTemplate(t) && t.slotExamples.length > 0) {
    return t.slotExamples.length;
  }
  return 1;
}
