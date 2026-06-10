const SILENT_MP3 =
  'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4T/hJAPAAAAAAD/+xDEAAPAAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxAADwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

let sharedAudio: HTMLAudioElement | null = null;
let unlockAudioEl: HTMLAudioElement | null = null;
let keepaliveAudio: HTMLAudioElement | null = null;

function createHiddenAudio(): HTMLAudioElement {
  const audio = document.createElement('audio');
  audio.setAttribute('playsinline', 'true');
  audio.setAttribute('webkit-playsinline', 'true');
  audio.preload = 'auto';
  audio.style.display = 'none';
  document.body.appendChild(audio);
  return audio;
}

export function getSharedAudioElement(): HTMLAudioElement {
  if (!sharedAudio && typeof document !== 'undefined') {
    sharedAudio = createHiddenAudio();
  }
  return sharedAudio!;
}

/** Unlock async audio on iOS without disturbing the main player. */
export function primeAudioPlayback(): void {
  if (typeof document === 'undefined') return;
  if (!unlockAudioEl) {
    unlockAudioEl = createHiddenAudio();
    unlockAudioEl.src = SILENT_MP3;
  }
  unlockAudioEl.currentTime = 0;
  void unlockAudioEl.play().catch(() => {
    // best-effort
  });
}

/** Keep the iOS audio session alive while practicing in the background. */
export function startAudioKeepalive(): void {
  if (typeof document === 'undefined') return;
  if (!keepaliveAudio) {
    keepaliveAudio = createHiddenAudio();
    keepaliveAudio.loop = true;
    keepaliveAudio.volume = 0.01;
    keepaliveAudio.src = SILENT_MP3;
  }
  keepaliveAudio.currentTime = 0;
  void keepaliveAudio.play().catch(() => {
    // best-effort
  });
}

export function stopAudioKeepalive(): void {
  keepaliveAudio?.pause();
}
