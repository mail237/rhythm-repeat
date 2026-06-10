type MediaHandlers = {
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
};

let handlers: MediaHandlers = {};

export function isMediaSessionSupported(): boolean {
  return typeof navigator !== 'undefined' && 'mediaSession' in navigator;
}

export function setMediaSessionHandlers(next: MediaHandlers): void {
  handlers = next;
  if (!isMediaSessionSupported()) return;

  const session = navigator.mediaSession;

  try {
    session.setActionHandler('play', () => handlers.onPlay?.());
    session.setActionHandler('pause', () => handlers.onPause?.());
    session.setActionHandler('stop', () => handlers.onStop?.());
  } catch {
    // Some browsers reject unsupported actions.
  }
}

export function updateMediaSessionMetadata(title: string, languageLabel: string): void {
  if (!isMediaSessionSupported()) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title,
    artist: 'Rhythm Repeat',
    album: languageLabel,
  });
}

export function setMediaSessionPlaybackState(
  state: MediaSessionPlaybackState,
): void {
  if (!isMediaSessionSupported()) return;
  navigator.mediaSession.playbackState = state;
}

export function clearMediaSession(): void {
  if (!isMediaSessionSupported()) return;
  navigator.mediaSession.metadata = null;
  navigator.mediaSession.playbackState = 'none';
}
