import { useCallback, useEffect, useState } from 'react';
import type { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

const SETTINGS_KEY = 'rr_settings';

function parseStoredSettings(raw: string): AppSettings {
  return JSON.parse(raw, (_key, value) =>
    value === 'Infinity' ? Infinity : value,
  ) as AppSettings;
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const stored = parseStoredSettings(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      googleTtsApiKey: '',
      voiceEngine: stored.voiceEngine ?? DEFAULT_SETTINGS.voiceEngine,
    };
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
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings, (_key, value) =>
        value === Infinity ? 'Infinity' : value,
      ),
    );
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
