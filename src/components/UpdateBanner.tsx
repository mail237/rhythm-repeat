import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

export function UpdateBanner() {
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [reloadApp, setReloadApp] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const reload = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedsRefresh(true);
      },
    });
    setReloadApp(() => reload);
  }, []);

  if (!needsRefresh) return null;

  const handleReload = () => {
    void reloadApp?.().then(() => {
      window.location.reload();
    });
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-violet-500/40 bg-gray-900 px-4 py-3 shadow-xl">
        <p className="text-sm text-gray-200">新しい版があります。AI提案が使えるようになります。</p>
        <button
          type="button"
          onClick={handleReload}
          className="shrink-0 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium hover:bg-violet-500"
        >
          再読み込み
        </button>
      </div>
    </div>
  );
}
