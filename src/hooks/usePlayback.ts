import { useCallback, useEffect, useRef, useState } from 'react';
import { getActiveWordIndex } from '../utils/words';
import { unlockAudio } from '../utils/audioUnlock';
import {
  clearMediaSession,
  setMediaSessionHandlers,
  setMediaSessionPlaybackState,
  updateMediaSessionMetadata,
} from '../utils/mediaSession';
import {
  getSharedAudioElement,
  startAudioKeepalive,
  stopAudioKeepalive,
} from '../utils/sharedAudio';
import type { Timepoint } from '../types';

interface PlaybackOptions {
  loopCount: number;
  playbackRate?: number;
  phraseText?: string;
  languageLabel?: string;
  onLoopComplete?: () => void;
}

export function usePlayback() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLoop, setCurrentLoop] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const timepointsRef = useRef<Timepoint[]>([]);
  const loopCountRef = useRef(1);
  const onLoopCompleteRef = useRef<(() => void) | undefined>(undefined);
  const rafRef = useRef<number>(0);

  const updateHighlight = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audio.paused) return;
    setActiveWordIndex(
      getActiveWordIndex(audio.currentTime, timepointsRef.current),
    );
  }, []);

  const stopHighlightLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const startHighlightLoop = useCallback(() => {
    const tick = () => {
      updateHighlight();
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [updateHighlight]);

  const stop = useCallback(() => {
    stopHighlightLoop();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.onended = null;
      audio.onplay = null;
      audio.onpause = null;
      audio.ontimeupdate = null;
    }
    setIsPlaying(false);
    setCurrentLoop(0);
    setActiveWordIndex(-1);
    stopAudioKeepalive();
    clearMediaSession();
  }, [stopHighlightLoop]);

  const togglePause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio.play();
      startHighlightLoop();
      setMediaSessionPlaybackState('playing');
      setIsPlaying(true);
    } else {
      audio.pause();
      stopHighlightLoop();
      setMediaSessionPlaybackState('paused');
      setIsPlaying(false);
    }
  }, [startHighlightLoop, stopHighlightLoop]);

  useEffect(() => {
    const resumeIfNeeded = () => {
      const audio = audioRef.current;
      if (!audio || audio.paused || audio.ended) return;
      void audio.play().catch(() => {
        // ignore
      });
    };

    document.addEventListener('visibilitychange', resumeIfNeeded);
    window.addEventListener('pageshow', resumeIfNeeded);

    setMediaSessionHandlers({
      onPlay: () => {
        const audio = audioRef.current;
        if (!audio || !audio.paused) return;
        void audio.play();
        startHighlightLoop();
        setMediaSessionPlaybackState('playing');
        setIsPlaying(true);
      },
      onPause: () => {
        const audio = audioRef.current;
        if (!audio || audio.paused) return;
        audio.pause();
        stopHighlightLoop();
        setMediaSessionPlaybackState('paused');
        setIsPlaying(false);
      },
      onStop: () => stop(),
    });

    return () => {
      document.removeEventListener('visibilitychange', resumeIfNeeded);
      window.removeEventListener('pageshow', resumeIfNeeded);
      stopHighlightLoop();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      stopAudioKeepalive();
      clearMediaSession();
    };
  }, [stop, stopHighlightLoop, togglePause]);

  const play = useCallback(
    async (audioUrl: string, timepoints: Timepoint[], options: PlaybackOptions) => {
      stop();

      loopCountRef.current = options.loopCount;
      onLoopCompleteRef.current = options.onLoopComplete;
      timepointsRef.current = timepoints;

      const audio = getSharedAudioElement();
      audioRef.current = audio;
      audio.src = audioUrl;
      audio.currentTime = 0;
      audio.playbackRate = options.playbackRate ?? 1;

      if (options.phraseText) {
        updateMediaSessionMetadata(
          options.phraseText,
          options.languageLabel ?? 'Language Practice',
        );
      }

      let loopsDone = 0;

      audio.onended = () => {
        loopsDone++;
        setCurrentLoop(loopsDone);
        onLoopCompleteRef.current?.();

        const maxLoops = loopCountRef.current;
        if (maxLoops === Infinity || loopsDone < maxLoops) {
          audio.currentTime = 0;
          void audio.play().catch(() => setIsPlaying(false));
        } else {
          stopHighlightLoop();
          setIsPlaying(false);
          setActiveWordIndex(-1);
          setMediaSessionPlaybackState('none');
          stopAudioKeepalive();
        }
      };

      audio.onplay = () => {
        setIsPlaying(true);
        setMediaSessionPlaybackState('playing');
        startAudioKeepalive();
        startHighlightLoop();
      };

      audio.onpause = () => {
        if (audio.ended) return;
        stopHighlightLoop();
        setIsPlaying(false);
        setMediaSessionPlaybackState('paused');
      };

      audio.ontimeupdate = () => {
        if (document.hidden) updateHighlight();
      };

      setCurrentLoop(0);
      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
        throw new Error('音声の再生に失敗しました。もう一度▶をタップしてください');
      }
    },
    [stop, stopHighlightLoop, startHighlightLoop, updateHighlight],
  );

  return {
    play,
    stop,
    togglePause,
    isPlaying,
    currentLoop,
    activeWordIndex,
    unlock: unlockAudio,
  };
}
