const SILENT_MP3 =
  'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4T/hJAPAAAAAAD/+xDEAAPAAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxAADwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

let sharedAudio: HTMLAudioElement | null = null;

export function getSharedAudioElement(): HTMLAudioElement {
  if (!sharedAudio && typeof document !== 'undefined') {
    sharedAudio = document.createElement('audio');
    sharedAudio.setAttribute('playsinline', 'true');
    sharedAudio.setAttribute('webkit-playsinline', 'true');
    sharedAudio.preload = 'auto';
    sharedAudio.style.display = 'none';
    document.body.appendChild(sharedAudio);
  }
  return sharedAudio!;
}

/** Play a silent clip inside the user gesture to unlock async audio on iOS. */
export function primeAudioPlayback(): void {
  const audio = getSharedAudioElement();
  if (!audio.paused && audio.currentTime > 0) return;

  const prevSrc = audio.src;
  audio.src = SILENT_MP3;
  audio.currentTime = 0;
  void audio.play().catch(() => {
    // ignore — best-effort unlock
  });
  if (prevSrc) audio.src = prevSrc;
}
