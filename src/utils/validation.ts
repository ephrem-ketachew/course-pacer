import { existsSync, statSync } from 'fs';
import { isDirectory } from './file-utils.js';
import { InvalidPathError, ConfigurationError } from './error-handler.js';
export function validateCoursePath(path: string): void {
  if (!existsSync(path)) {
    throw new InvalidPathError(`Path does not exist: ${path}`);
  }
  if (!isDirectory(path)) {
    throw new InvalidPathError(`Path is not a directory: ${path}`);
  }
  try {
    statSync(path);
  } catch {
    throw new InvalidPathError(`Cannot access directory: ${path}`);
  }
}
export function validatePlaybackSpeed(speed: number): void {
  if (isNaN(speed)) {
    throw new ConfigurationError('Playback speed must be a number');
  }
  if (speed < 0.5 || speed > 3.0) {
    throw new ConfigurationError(
      `Playback speed must be between 0.5 and 3.0 (got ${speed})`
    );
  }
}
export function validatePracticeMultiplier(multiplier: number): void {
  if (isNaN(multiplier)) {
    throw new ConfigurationError('Practice multiplier must be a number');
  }
  if (multiplier < 0 || multiplier > 10) {
    throw new ConfigurationError(
      `Practice multiplier must be between 0.0 and 10.0 (got ${multiplier})`
    );
  }
}
export function validateVideoId(videoId: string): void {
  if (!videoId || videoId.trim().length === 0) {
    throw new Error('Video ID cannot be empty');
  }
}
