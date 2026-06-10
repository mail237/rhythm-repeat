export function formatTtsError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('quota') || lower.includes('429') || lower.includes('resource_exhausted')) {
    return '音声の利用上限に達しました。しばらく待ってからもう一度▶をタップしてください。';
  }

  if (lower.includes('cloud text-to-speech') || lower.includes('texttospeech.googleapis.com')) {
    return '音声を取得できませんでした。しばらくしてからもう一度お試しください。';
  }

  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'ネットワークエラーです。接続を確認してください。';
  }

  return '音声を取得できませんでした。もう一度▶をタップしてください。';
}
