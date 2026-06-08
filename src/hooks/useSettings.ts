import { useCallback, useEffect, useState } from 'react';
import type { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

const SETTINGS_KEY = 'rr_settings';

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const stored = JSON.parse(raw) as AppSettings;
    return { ...DEFAULT_SETTINGS, ...stored };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function maybeResetMonthlyCount(settings: AppSettings): AppSettings {
  const resetMonth = settings.monthlyCharCountResetAt.slice(0, 7);
  const currentMonth = new Date().toISOString().slice(0, 7);
  if (resetMonth !== currentMonth) {
    return {
      ...settings,
      monthlyCharCount: 0,
      monthlyCharCountResetAt: new Date().toISOString(),
    };
  }
  return settings;
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() =>
    maybeResetMonthlyCount(loadSettings()),
  );

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const addCharCount = useCallback((chars: number) => {
    setSettings((prev) => {
      const updated = maybeResetMonthlyCount(prev);
      return { ...updated, monthlyCharCount: updated.monthlyCharCount + chars };
    });
  }, []);

  return { settings, updateSettings, addCharCount };
}
