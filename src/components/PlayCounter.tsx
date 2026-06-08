interface Props {
  sessionToday: number;
  sessionTotal: number;
}

export function PlayCounter({ sessionToday, sessionTotal }: Props) {
  return (
    <div className="flex justify-center gap-6 text-sm text-gray-400">
      <span>
        今日: <strong className="text-violet-400">{sessionToday}</strong>回
      </span>
      <span>
        合計: <strong className="text-gray-200">{sessionTotal}</strong>回
      </span>
    </div>
  );
}
