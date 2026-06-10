import { useCallback, useEffect, useRef, useState } from 'react';
import { getActiveWordIndex } from '../utils/words';
import { unlockAudio } from '../utils/audioUnlock';
import { isInfiniteLoop, normalizeLoopCount } from '../utils/loopCount';
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
  const lastTimeRef = useRef(0);
  const loopsDoneRef = useRef(0);

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

  const finishPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.loop = false;
      audio.pause();
      audio.currentTime = 0;
      audio.onended = null;
      audio.onplay = null;
      audio.onpause = null;
      audio.ontimeupdate = null;
    }
    stopHighlightLoop();
    setIsPlaying(false);
    setActiveWordIndex(-1);
    setMediaSessionPlaybackState('none');
    stopAudioKeepalive();
  }, [stopHighlightLoop]);

  const stop = useCallback(() => {
    finishPlayback();
    setCurrentLoop(0);
    loopsDoneRef.current = 0;
    lastTimeRef.current = 0;
    clearMediaSession();
  }, [finishPlayback]);

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
      if (!audio || !audio.paused || audio.ended) return;
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
  }, [stop, stopHighlightLoop, startHighlightLoop]);

  const play = useCallback(
    async (audioUrl: string, timepoints: Timepoint[], options: PlaybackOptions) => {
      stop();

      const maxLoops = normalizeLoopCount(options.loopCount);
      loopCountRef.current = maxLoops;
      onLoopCompleteRef.current = options.onLoopComplete;
      timepointsRef.current = timepoints;
      loopsDoneRef.current = 0;
      lastTimeRef.current = 0;

      const audio = getSharedAudioElement();
      audioRef.current = audio;
      audio.src = audioUrl;
      audio.currentTime = 0;
      audio.playbackRate = options.playbackRate ?? 1;
      audio.loop = maxLoops !== 1;

      if (options.phraseText) {
        updateMediaSessionMetadata(
          options.phraseText,
          options.languageLabel ?? 'Language Practice',
        );
      }

      const handleLoopWrap = () => {
        loopsDoneRef.current += 1;
        setCurrentLoop(loopsDoneRef.current);
        onLoopCompleteRef.current?.();

        if (!isInfiniteLoop(maxLoops) && loopsDoneRef.current >= maxLoops) {
          finishPlayback();
        }
      };

      if (maxLoops === 1) {
        audio.onended = () => {
          loopsDoneRef.current = 1;
          setCurrentLoop(1);
          onLoopCompleteRef.current?.();
          finishPlayback();
        };
      }

      audio.onplay = () => {
        setIsPlaying(true);
        setMediaSessionPlaybackState('playing');
        startAudioKeepalive();
        startHighlightLoop();
      };

      audio.onpause = () => {
        if (audio.ended && maxLoops === 1) return;
        if (!audio.loop && audio.ended) return;
        stopHighlightLoop();
        setIsPlaying(false);
        setMediaSessionPlaybackState('paused');
      };

      audio.ontimeupdate = () => {
        const t = audio.currentTime;
        if (maxLoops !== 1 && t + 0.25 < lastTimeRef.current) {
          handleLoopWrap();
        }
        lastTimeRef.current = t;
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
    [stop, finishPlayback, startHighlightLoop, updateHighlight],
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
