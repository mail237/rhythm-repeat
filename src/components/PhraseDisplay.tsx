import { splitIntoWords } from '../utils/words';

interface Props {
  text: string;
  activeWordIndex: number;
  isPlaying: boolean;
  translation?: string;
}

export function PhraseDisplay({
  text,
  activeWordIndex,
  isPlaying,
  translation,
}: Props) {
  const words = splitIntoWords(text);

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {isPlaying && (
        <div className="flex items-end gap-1 h-8" aria-hidden="true">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="wave-bar w-1 bg-violet-500 rounded-full h-8 origin-bottom"
            />
          ))}
        </div>
      )}

      <p className="text-center text-2xl sm:text-4xl font-semibold leading-relaxed max-w-2xl px-4">
        {words.length > 0 ? (
          words.map((word, i) => (
            <span key={`${word}-${i}`}>
              <span
                className={`transition-colors duration-150 ${
                  i === activeWordIndex
                    ? 'text-violet-400 bg-violet-400/10 rounded px-1'
                    : 'text-gray-100'
                }`}
              >
                {word}
              </span>
              {i < words.length - 1 ? ' ' : ''}
            </span>
          ))
        ) : (
          <span className="text-gray-600 italic">フレーズを入力してください</span>
        )}
      </p>

      {translation && (
        <p className="text-gray-400 text-sm sm:text-base">{translation}</p>
      )}
    </div>
  );
}
