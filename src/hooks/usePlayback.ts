import { useCallback, useEffect, useRef, useState } from 'react';
import { getActiveWordIndex } from '../utils/words';
import { unlockAudio } from '../utils/audioUnlock';
import type { Timepoint } from '../types';

interface PlaybackOptions {
  loopCount: number;
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

  const stopHighlightLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const startHighlightLoop = useCallback(() => {
    const tick = () => {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        setActiveWordIndex(
          getActiveWordIndex(audio.currentTime, timepointsRef.current),
        );
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stop = useCallback(() => {
    stopHighlightLoop();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentLoop(0);
    setActiveWordIndex(-1);
  }, [stopHighlightLoop]);

  const play = useCallback(
    async (audioUrl: string, timepoints: Timepoint[], options: PlaybackOptions) => {
      stop();

      loopCountRef.current = options.loopCount;
      onLoopCompleteRef.current = options.onLoopComplete;
      timepointsRef.current = timepoints;

      const audio = new Audio(audioUrl);
      audio.setAttribute('playsinline', 'true');
      audio.preload = 'auto';
      audioRef.current = audio;

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
        }
      };

      audio.onplay = () => {
        setIsPlaying(true);
        startHighlightLoop();
      };

      audio.onpause = () => {
        if (audio.ended) return;
        stopHighlightLoop();
        setIsPlaying(false);
      };

      setCurrentLoop(0);
      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
        throw new Error('音声の再生に失敗しました。もう一度▶をタップしてください');
      }
    },
    [stop, stopHighlightLoop, startHighlightLoop],
  );

  const togglePause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio.play();
      startHighlightLoop();
    } else {
      audio.pause();
      stopHighlightLoop();
    }
  }, [startHighlightLoop, stopHighlightLoop]);

  useEffect(() => {
    return () => {
      stopHighlightLoop();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [stopHighlightLoop]);

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
