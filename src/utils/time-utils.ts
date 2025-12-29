export function parseTimeToSeconds(timeString: string): number {
  const trimmed = timeString.trim().toLowerCase();
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*([hm])$/);
  if (!match) {
    throw new Error(
      `Invalid time format: ${timeString}. Use format like "3h" or "180m"`
    );
  }
  const value = parseFloat(match[1] ?? '0');
  const unit = match[2];
  if (unit === 'h') {
    return Math.round(value * 3600);
  } else if (unit === 'm') {
    return Math.round(value * 60);
  }
  throw new Error(`Unknown time unit: ${unit}`);
}
export function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
export function formatSecondsShort(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
}
export function adjustDurationForSpeed(
  durationSeconds: number,
  playbackSpeed: number
): number {
  if (playbackSpeed <= 0) {
    throw new Error('Playback speed must be greater than 0');
  }
  return durationSeconds / playbackSpeed;
}
export function calculatePracticeTime(
  videoDurationSeconds: number,
  multiplier: number
): number {
  return videoDurationSeconds * multiplier;
}
