import type { AppSettings } from '../types';
import { LANGUAGE_CONFIG, LOOP_OPTIONS, SPEED_OPTIONS } from '../types';

interface Props {
  open: boolean;
  settings: AppSettings;
  onClose: () => void;
  onSave: (patch: Partial<AppSettings>) => void;
}

function loopLabel(count: number): string {
  return count === Infinity ? '∞' : String(count);
}

export function SettingsModal({ open, settings, onClose, onSave }: Props) {
  if (!open) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const loopVal = fd.get('defaultLoopCount');
    onSave({
      defaultLanguage: (fd.get('defaultLanguage') as 'en' | 'de') ?? 'en',
      defaultLoopCount: loopVal === 'Infinity' ? Infinity : Number(loopVal),
      defaultSpeed: Number(fd.get('defaultSpeed')),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="閉じる"
      />
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">⚙️ 設定</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm text-gray-400 mb-1">デフォルト言語</legend>
            <div className="flex gap-2">
              {(Object.keys(LANGUAGE_CONFIG) as ('en' | 'de')[]).map((lang) => (
                <label
                  key={lang}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-800 cursor-pointer has-[:checked]:bg-violet-600 has-[:checked]:text-white text-sm"
                >
                  <input
                    type="radio"
                    name="defaultLanguage"
                    value={lang}
                    defaultChecked={settings.defaultLanguage === lang}
                    className="sr-only"
                  />
                  {LANGUAGE_CONFIG[lang].flag} {LANGUAGE_CONFIG[lang].label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm text-gray-400 mb-1">デフォルトループ回数</legend>
            <div className="flex gap-1 flex-wrap">
              {LOOP_OPTIONS.map((opt) => (
                <label
                  key={String(opt)}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 cursor-pointer has-[:checked]:bg-violet-600 has-[:checked]:text-white text-sm"
                >
                  <input
                    type="radio"
                    name="defaultLoopCount"
                    value={opt === Infinity ? 'Infinity' : opt}
                    defaultChecked={settings.defaultLoopCount === opt}
                    className="sr-only"
                  />
                  {loopLabel(opt)}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm text-gray-400 mb-1">デフォルト速度</legend>
            <div className="flex gap-1">
              {SPEED_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className="flex-1 py-1.5 rounded-lg bg-gray-800 text-center cursor-pointer has-[:checked]:bg-violet-600 has-[:checked]:text-white text-sm"
                >
                  <input
                    type="radio"
                    name="defaultSpeed"
                    value={opt}
                    defaultChecked={settings.defaultSpeed === opt}
                    className="sr-only"
                  />
                  {opt}x
                </label>
              ))}
            </div>
          </fieldset>

          <div className="bg-gray-800/50 rounded-lg p-3 text-sm text-gray-400">
            今月のTTS使用文字数:{' '}
            <strong className="text-gray-200">
              {settings.monthlyCharCount.toLocaleString()}
            </strong>{' '}
            / 40,000（無料枠）
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            APIキーはサーバー側（.env または Vercel 環境変数）で管理されます。
            フロントエンドにキーは保存されません。
          </p>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm bg-violet-600 hover:bg-violet-500 font-medium"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
