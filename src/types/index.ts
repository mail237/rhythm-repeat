export type Language = 'en' | 'de';
export type VoiceEngine = 'device' | 'server';

export interface PhraseStats {
  totalPlays: number;
  todayPlays: number;
  lastPracticedAt: string;
  streak: number;
}

export interface Phrase {
  id: string;
  text: string;
  language: Language;
  translation?: string;
  context?: string;
  createdAt: string;
  stats: PhraseStats;
}

export interface AppSettings {
  defaultLanguage: Language;
  defaultLoopCount: number;
  defaultSpeed: number;
  voiceEngine: VoiceEngine;
  googleTtsApiKey: string;
  anthropicApiKey: string;
  monthlyCharCount: number;
  monthlyCharCountResetAt: string;
}

export interface TTSResult {
  audioContent: string;
  timepoints: Timepoint[];
  fromCache: boolean;
  mimeType?: string;
}

export interface Timepoint {
  markName: string;
  timeSeconds: number;
}

export interface SuggestedPhrase {
  text: string;
  translation: string;
  context: string;
  register: 'casual' | 'neutral' | 'formal';
}

export const LANGUAGE_CONFIG = {
  en: {
    label: 'English',
    flag: '🇺🇸',
    languageCode: 'en-US',
    voiceName: 'en-US-Neural2-F',
  },
  de: {
    label: 'Deutsch',
    flag: '🇩🇪',
    languageCode: 'de-DE',
    voiceName: 'de-DE-Neural2-B',
  },
} as const;

export const LOOP_OPTIONS = [1, 3, 5, 10, Infinity] as const;
export const SPEED_OPTIONS = [0.75, 1.0, 1.25] as const;

export const DEFAULT_SETTINGS: AppSettings = {
  defaultLanguage: 'en',
  defaultLoopCount: 3,
  defaultSpeed: 1.0,
  voiceEngine: 'device',
  googleTtsApiKey: '',
  anthropicApiKey: '',
  monthlyCharCount: 0,
  monthlyCharCountResetAt: new Date().toISOString(),
};
