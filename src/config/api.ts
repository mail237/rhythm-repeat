/** Server-side proxy is always used. Keys live in .env (dev) or Vercel env (prod). */
export const API_BASE = '/api';

export function hasServerProxy(): boolean {
  return true;
}
