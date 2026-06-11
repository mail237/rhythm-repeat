import type { PhraseTemplateCompact, PhraseTemplateFull } from '../data/templates/types';

export function isFullTemplate(
  t: PhraseTemplateCompact | PhraseTemplateFull,
): t is PhraseTemplateFull {
  return 'derivatives' in t;
}

/** ループ練習用の具体文（穴埋め型そのままより派生例を優先） */
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
