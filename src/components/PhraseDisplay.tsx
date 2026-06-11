import { splitIntoWords } from '../utils/words';

interface Props {
  text: string;
  activeWordIndex: number;
  isPlaying: boolean;
  translation?: string;
  translating?: boolean;
  translateError?: string | null;
}

export function PhraseDisplay({
  text,
  activeWordIndex,
  isPlaying,
  translation,
  translating = false,
  translateError = null,
}: Props) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const isMultiline = lines.length > 1;

  const renderWords = (lineText: string, startIndex: number) => {
    const lineWords = splitIntoWords(lineText);
    let index = startIndex;

    return lineWords.map((word) => {
      const wordIndex = index;
      index += 1;
      return (
        <span key={`${wordIndex}-${word}`}>
          <span
            className={`transition-colors duration-150 ${
              wordIndex === activeWordIndex
                ? 'text-violet-400 bg-violet-400/10 rounded px-1'
                : 'text-gray-100'
            }`}
          >
            {word}
          </span>{' '}
        </span>
      );
    });
  };

  let globalWordIndex = 0;

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

      <div
        className={`text-center font-semibold leading-relaxed max-w-2xl px-4 ${
          isMultiline ? 'text-lg sm:text-2xl space-y-3' : 'text-2xl sm:text-4xl'
        }`}
      >
        {lines.length > 0 ? (
          lines.map((line, lineIndex) => {
            const startIndex = globalWordIndex;
            const lineWords = splitIntoWords(line);
            globalWordIndex += lineWords.length;
            return (
              <p key={`${lineIndex}-${line}`}>{renderWords(line, startIndex)}</p>
            );
          })
        ) : (
          <p className="text-gray-600 italic">フレーズを入力してください</p>
        )}
      </div>

      {translating && !translation && (
        <p className="text-gray-500 text-sm animate-pulse">翻訳中...</p>
      )}
      {translateError && !translation && (
        <p className="text-amber-400 text-sm">{translateError}</p>
      )}
      {translation && (
        <p className="text-gray-400 text-sm sm:text-base">{translation}</p>
      )}
    </div>
  );
}
