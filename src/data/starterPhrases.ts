import type { Language, SuggestedPhrase } from '../types';

export const STARTER_PHRASES: Record<Language, SuggestedPhrase[]> = {
  en: [
    {
      text: "I'm beat.",
      translation: '疲れた。',
      context: 'カジュアルに疲れを伝えるとき。友達との会話向け。',
      register: 'casual',
    },
    {
      text: "Could you say that again?",
      translation: 'もう一度言ってもらえますか？',
      context: '聞き取れなかったときに丁寧に頼むフレーズ。',
      register: 'neutral',
    },
    {
      text: "That makes sense.",
      translation: 'なるほど、わかる。',
      context: '相手の説明に納得したとき。',
      register: 'casual',
    },
    {
      text: "I appreciate it.",
      translation: 'ありがとう、助かる。',
      context: '感謝を伝える定番フレーズ。',
      register: 'neutral',
    },
  ],
  de: [
    {
      text: 'Ich bin müde.',
      translation: '疲れた。',
      context: 'シンプルに疲れを伝えるとき。',
      register: 'neutral',
    },
    {
      text: 'Können Sie das bitte wiederholen?',
      translation: 'もう一度言っていただけますか？',
      context: '丁寧に聞き返すとき。',
      register: 'formal',
    },
    {
      text: 'Stimmt genau.',
      translation: 'その通りだね。',
      context: '同意・納得を示すとき。',
      register: 'casual',
    },
    {
      text: 'Vielen Dank!',
      translation: 'どうもありがとう！',
      context: '感謝の基本フレーズ。',
      register: 'neutral',
    },
  ],
};
