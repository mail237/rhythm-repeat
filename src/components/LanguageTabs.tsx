import type { Language } from '../types';
import { LANGUAGE_CONFIG } from '../types';

interface Props {
  language: Language;
  onChange: (lang: Language) => void;
}

export function LanguageTabs({ language, onChange }: Props) {
  return (
    <div className="flex gap-2 p-1 bg-gray-900 rounded-xl border border-gray-800">
      {(Object.keys(LANGUAGE_CONFIG) as Language[]).map((lang) => {
        const config = LANGUAGE_CONFIG[lang];
        const active = language === lang;
        return (
          <button
            key={lang}
            type="button"
            onClick={() => onChange(lang)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              active
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            {config.flag} {config.label}
          </button>
        );
      })}
    </div>
  );
}
