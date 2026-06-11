import type { TemplateFamily } from './types';

export interface TemplateFamilyGroup {
  id: TemplateFamily;
  labelJa: string;
  labelEn: string;
  description: string;
  relatedIds: string[];
  corePatterns: string[];
}

/** ネイティブの脳内で近接するチャンク群 */
export const TEMPLATE_FAMILIES: TemplateFamilyGroup[] = [
  {
    id: 'THINK',
    labelJa: 'THINK系（考える・意見）',
    labelEn: 'THINK / BELIEVE / OPINION',
    description: '意見・判断・思い込み。I think / I guess / I believe で会話の主張を組み立てる。',
    relatedIds: ['T001', 'T002', 'T003', 'T004', 'T005', 'T006', 'T007', 'T008'],
    corePatterns: [
      'I think ___.',
      "I don't think ___.",
      'I thought ___.',
      "I'm thinking about ___.",
      'I guess ___.',
      "I'd say ___.",
    ],
  },
  {
    id: 'KNOW',
    labelJa: 'KNOW系（知る・わからない）',
    labelEn: 'KNOW / REMEMBER / FORGET',
    description: '情報の有無・確信度。会話で最頻出クラスタの一つ。',
    relatedIds: ['T009', 'T010', 'T011', 'T012', 'T013'],
    corePatterns: [
      "I don't know.",
      "I don't know if ___.",
      'I know ___.',
      "I'm not sure if ___.",
      "I'm not sure about ___.",
    ],
  },
  {
    id: 'FEEL',
    labelJa: 'FEEL系（感情・体感）',
    labelEn: 'FEEL / LIKE / MOOD',
    description: '感情・直感・体調。feel like は口語の万能型。',
    relatedIds: ['T014', 'T015', 'T016', 'T017'],
    corePatterns: [
      'I feel ___.',
      'I feel like ___.',
      "I'm feeling ___.",
      "I'm not feeling ___.",
    ],
  },
  {
    id: 'GO',
    labelJa: 'GO系（行く・向かう）',
    labelEn: 'GO / COME / LEAVE',
    description: '移動・予定・到着。gonna / going to とセットで覚える。',
    relatedIds: ['T018', 'T019', 'T020', 'T021', 'T022'],
    corePatterns: [
      "I'm gonna ___.",
      "I'm going to ___.",
      'I went to ___.',
      "I'm on my way to ___.",
      "I just got here.",
    ],
  },
  {
    id: 'GET',
    labelJa: 'GET系（なる・手に入れる）',
    labelEn: 'GET / GOT / GETTING',
    description: '変化・取得・慣れ。get + adj / get to が超高頻度。',
    relatedIds: ['T023', 'T024', 'T025', 'T026'],
    corePatterns: [
      'I got ___.',
      "I'm getting ___.",
      'I get ___.',
      'I got to ___.',
    ],
  },
  {
    id: 'HAVE',
    labelJa: 'HAVE系（持つ・経験）',
    labelEn: 'HAVE / GOT / HAD',
    description: '所有・経験・義務 have to。口語は I\'ve got。',
    relatedIds: ['T027', 'T028', 'T029', 'T030'],
    corePatterns: [
      'I have ___.',
      "I've got ___.",
      'I had ___.',
      'I have to ___.',
    ],
  },
  {
    id: 'MAKE',
    labelJa: 'MAKE系（作る・させる）',
    labelEn: 'MAKE / MADE',
    description: 'make + O + C / make sure / make it。実用度が高い。',
    relatedIds: ['T031', 'T032', 'T033'],
    corePatterns: [
      'It makes me ___.',
      'Make sure ___.',
      'That makes sense.',
    ],
  },
  {
    id: 'TAKE',
    labelJa: 'TAKE系（かかる・連れて行く）',
    labelEn: 'TAKE / TOOK',
    description: '時間・手間・take care / take a look。',
    relatedIds: ['T034', 'T035', 'T036'],
    corePatterns: [
      'It takes ___.',
      'It took me ___.',
      'Take your time.',
    ],
  },
  {
    id: 'LOOK',
    labelJa: 'LOOK系（見る・探す）',
    labelEn: 'LOOK / SEE / CHECK',
    description: 'look like / look for / check out。視覚＋推測。',
    relatedIds: ['T037', 'T038', 'T039', 'T040'],
    corePatterns: [
      'It looks ___.',
      "I'm looking for ___.",
      "I'm looking forward to ___.",
      'Check this out.',
    ],
  },
  {
    id: 'WANT',
    labelJa: 'WANT系（欲しい・したい）',
    labelEn: 'WANT / WISH / NEED',
    description: '欲求・希望・必要性。I wish / I need to も同クラスタ。',
    relatedIds: ['T041', 'T042', 'T043', 'T044'],
    corePatterns: [
      'I want to ___.',
      'I wanted to ___.',
      'I wish I could ___.',
      'I need to ___.',
    ],
  },
  {
    id: 'TRY',
    labelJa: 'TRY系（試す・始める）',
    labelEn: 'TRY / START / STOP / END UP',
    description: '試行・開始・結果。end up / manage to が口語的。',
    relatedIds: ['T045', 'T046', 'T047', 'T048'],
    corePatterns: [
      "I'll try to ___.",
      'I tried to ___.',
      'I ended up ___.',
      "I couldn't help but ___.",
    ],
  },
  {
    id: 'TIME',
    labelJa: 'TIME系（時間・予定）',
    labelEn: 'TIME / PLAN / SCHEDULE',
    description: 'was gonna / used to / about to。時間軸の型。',
    relatedIds: ['T049', 'T050', 'T051', 'T052'],
    corePatterns: [
      'I was gonna ___, but ___.',
      'I used to ___.',
      "I'm about to ___.",
      "It's been a while since ___.",
    ],
  },
  {
    id: 'IF',
    labelJa: 'IF系（条件・依存）',
    labelEn: 'IF / DEPENDS / UNLESS',
    description: '条件分岐。depends on / what if が会話を回す。',
    relatedIds: ['T053', 'T054', 'T055', 'T056'],
    corePatterns: [
      'It depends on ___.',
      'If ___, then ___.',
      'What if ___?',
      'Even if ___, ___.',
    ],
  },
  {
    id: 'QUESTION',
    labelJa: 'QUESTION系（質問）',
    labelEn: 'QUESTION / ASK',
    description: '会話を維持する質問型。What do you think? など。',
    relatedIds: ['T057', 'T058', 'T059', 'T060'],
    corePatterns: [
      'What do you think?',
      'How come ___?',
      'Do you mind if ___?',
      'Have you ever ___?',
    ],
  },
  {
    id: 'REQUEST',
    labelJa: 'REQUEST系（依頼・許可）',
    labelEn: 'REQUEST / PERMISSION',
    description: 'Can you / Could you / Do you mind。丁寧さの段階付き。',
    relatedIds: ['T061', 'T062', 'T063', 'T064'],
    corePatterns: [
      'Can you ___?',
      'Could you ___?',
      'Do you mind ___?',
      'Would you mind ___?',
    ],
  },
  {
    id: 'REACT',
    labelJa: 'REACT系（リアクション）',
    labelEn: 'REACT / RESPOND',
    description: '相槌・共感・驚き。That sounds / No way / I hear you。',
    relatedIds: ['T065', 'T066', 'T067', 'T068'],
    corePatterns: [
      'That sounds ___.',
      'No way!',
      'I hear you.',
      'Tell me about it.',
    ],
  },
  {
    id: 'DISCOURSE',
    labelJa: 'DISCOURSE系（談話マーカー）',
    labelEn: 'DISCOURSE MARKERS',
    description: 'I mean / you know / actually / basically。ネイティブの「間」。',
    relatedIds: ['T069', 'T070', 'T071', 'T072'],
    corePatterns: [
      'I mean, ___.',
      'You know, ___.',
      'Actually, ___.',
      'Basically, ___.',
    ],
  },
  {
    id: 'COMPARISON',
    labelJa: 'COMPARISON系（比較）',
    labelEn: 'COMPARE / CONTRAST',
    description: 'better than / compared to / the same as。',
    relatedIds: ['T073', 'T074', 'T075'],
    corePatterns: [
      "It's better than ___.",
      'Compared to ___, ___.',
      "It's not as ___ as ___.",
    ],
  },
  {
    id: 'EXPERIENCE',
    labelJa: 'EXPERIENCE系（経験）',
    labelEn: 'EXPERIENCE / EVER / BEFORE',
    description: "I've never / I've been / the first time。経験の語り。",
    relatedIds: ['T076', 'T077', 'T078', 'T079'],
    corePatterns: [
      "I've never ___ before.",
      "I've been ___ing.",
      "It's the first time ___.",
      'I used to ___, but now ___.',
    ],
  },
  {
    id: 'MODAL',
    labelJa: 'MODAL系（助動詞・推量）',
    labelEn: 'MODAL / MIGHT / SHOULD',
    description: 'might / should / supposed to / supposed to be。',
    relatedIds: ['T080', 'T081', 'T082', 'T083'],
    corePatterns: [
      'I might ___.',
      'I should ___.',
      "I'm supposed to ___.",
      "It's supposed to ___.",
    ],
  },
];

/** カバレッジ目標（コーパス口語頻度＋チャンク学習理論に基づく設計目標値） */
export const COVERAGE_TARGETS = {
  top20: { label: '上位20', coverage: 0.5, description: '日常会話ターンの約半分をカバー' },
  top100: { label: '上位100', coverage: 0.8, description: '日常会話の大部分をカバー' },
  top300: { label: '上位300', coverage: 0.95, description: '実質的な網羅' },
  top1000: { label: '上位1000', coverage: 0.99, description: '表現の幅・場面特化を補完' },
} as const;
