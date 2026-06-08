import { LOOP_OPTIONS, SPEED_OPTIONS } from '../types';

interface Props {
  loopCount: number;
  speed: number;
  isPlaying: boolean;
  isLoading: boolean;
  canPlay: boolean;
  onLoopChange: (count: number) => void;
  onSpeedChange: (speed: number) => void;
  onPlay: () => void;
  onTogglePause: () => void;
  onStop: () => void;
}

function loopLabel(count: number): string {
  return count === Infinity ? '∞' : String(count);
}

export function PlaybackControls({
  loopCount,
  speed,
  isPlaying,
  isLoading,
  canPlay,
  onLoopChange,
  onSpeedChange,
  onPlay,
  onTogglePause,
  onStop,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={isPlaying ? onTogglePause : onPlay}
          disabled={!canPlay || isLoading}
          className="w-14 h-14 rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-2xl shadow-lg shadow-violet-900/50 transition-colors"
          aria-label={isPlaying ? '一時停止' : '再生'}
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isPlaying ? (
            '⏸'
          ) : (
            '▶'
          )}
        </button>
        {isPlaying && (
          <button
            type="button"
            onClick={onStop}
            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 text-lg transition-colors"
            aria-label="停止"
          >
            ⏹
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-gray-500 text-center">🔁 ループ</span>
          <div className="flex gap-1">
            {LOOP_OPTIONS.map((opt) => (
              <button
                key={String(opt)}
                type="button"
                onClick={() => onLoopChange(opt)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  loopCount === opt
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {loopLabel(opt)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-gray-500 text-center">🐢 速度</span>
          <div className="flex gap-1">
            {SPEED_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onSpeedChange(opt)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  speed === opt
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {opt}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
