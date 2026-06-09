import type { AppSettings } from '../types';

export function hasApiKeys(settings: AppSettings): boolean {
  return !!(settings.googleTtsApiKey && settings.anthropicApiKey);
}

export function hasTtsKey(settings: AppSettings): boolean {
  return !!settings.googleTtsApiKey;
}

export function hasAnthropicKey(settings: AppSettings): boolean {
  return !!settings.anthropicApiKey;
}
