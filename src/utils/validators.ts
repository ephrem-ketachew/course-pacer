import { z } from 'zod';
export function validateVideoPath(path: string): boolean {
  return typeof path === 'string' && path.length > 0;
}
export function validateTimeString(timeString: string): boolean {
  const trimmed = timeString.trim().toLowerCase();
  return /^\d+(?:\.\d+)?\s*[hm]$/.test(trimmed);
}
export function validatePlaybackSpeed(speed: number): boolean {
  return speed >= 0.5 && speed <= 3.0;
}
export function validatePracticeMultiplier(multiplier: number): boolean {
  return multiplier >= 0 && multiplier <= 10;
}
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.errors.map((e) => e.message).join(', '),
  };
}
