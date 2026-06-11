export type TemplateCategory =
  | '意見'
  | '感情'
  | '理由'
  | '予定'
  | '経験'
  | '依頼'
  | '提案'
  | '許可'
  | '比較'
  | '仮定'
  | '推測'
  | '質問'
  | '説明'
  | '問題解決'
  | '人間関係'
  | '仕事'
  | '学校'
  | '趣味'
  | '旅行'
  | '買い物'
  | '日常生活'
  | 'その他';

export type TemplateFamily =
  | 'THINK'
  | 'KNOW'
  | 'FEEL'
  | 'GO'
  | 'GET'
  | 'HAVE'
  | 'MAKE'
  | 'TAKE'
  | 'LOOK'
  | 'WANT'
  | 'TRY'
  | 'TIME'
  | 'IF'
  | 'QUESTION'
  | 'REQUEST'
  | 'REACT'
  | 'DISCOURSE'
  | 'COMPARISON'
  | 'EXPERIENCE'
  | 'MODAL';

export interface PhraseTemplateFull {
  id: string;
  rank: number;
  category: TemplateCategory;
  family: TemplateFamily;
  template: string;
  translation: string;
  frequency: number;
  applicability: number;
  beginnerFit: number;
  loopFit: number;
  slots: string[];
  slotExamples: string[];
  derivatives: string[];
  context: string;
}

export interface PhraseTemplateCompact {
  id: string;
  rank: number;
  category: TemplateCategory;
  family: TemplateFamily;
  template: string;
  translation: string;
  frequency: number;
  applicability: number;
  beginnerFit: number;
  loopFit: number;
}
