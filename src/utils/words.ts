export function splitIntoWords(text: string): string[] {
  return text.match(/\S+/g) ?? [];
}

export function getActiveWordIndex(
  currentTime: number,
  timepoints: { markName: string; timeSeconds: number }[],
): number {
  if (timepoints.length === 0) return -1;

  let active = 0;
  for (let i = 0; i < timepoints.length; i++) {
    if (currentTime >= timepoints[i].timeSeconds) {
      active = i;
    } else {
      break;
    }
  }
  return active;
}
