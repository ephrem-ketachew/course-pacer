import chalk from 'chalk';
export class CourseNotFoundError extends Error {
  constructor(path: string) {
    super(`Course not found: ${path}`);
    this.name = 'CourseNotFoundError';
  }
}
export class VideoNotFoundError extends Error {
  constructor(videoId: string) {
    super(`Video not found: ${videoId}`);
    this.name = 'VideoNotFoundError';
  }
}
export class InvalidTimeFormatError extends Error {
  constructor(timeString: string) {
    super(
      `Invalid time format: "${timeString}". Use format like "3h" or "180m"`
    );
    this.name = 'InvalidTimeFormatError';
  }
}
export class InvalidPathError extends Error {
  constructor(path: string) {
    super(`Invalid path: ${path}`);
    this.name = 'InvalidPathError';
  }
}
export class ConfigurationError extends Error {
  constructor(message: string) {
    super(`Configuration error: ${message}`);
    this.name = 'ConfigurationError';
  }
}
export function handleError(error: unknown, context?: string): void {
  const prefix = context ? chalk.gray(`[${context}] `) : '';
  if (error instanceof CourseNotFoundError) {
    console.error(
      prefix +
        chalk.red('❌ Course Not Found') +
        '\n' +
        chalk.yellow(`   ${error.message}`) +
        '\n' +
        chalk.gray('   Tip: Run "pacer scan <path>" to add a course.')
    );
  } else if (error instanceof VideoNotFoundError) {
    console.error(
      prefix +
        chalk.red('❌ Video Not Found') +
        '\n' +
        chalk.yellow(`   ${error.message}`) +
        '\n' +
        chalk.gray('   Tip: Use "pacer status" to see available videos.')
    );
  } else if (error instanceof InvalidTimeFormatError) {
    console.error(
      prefix +
        chalk.red('❌ Invalid Time Format') +
        '\n' +
        chalk.yellow(`   ${error.message}`) +
        '\n' +
        chalk.gray('   Examples: "3h", "180m", "2.5h"')
    );
  } else if (error instanceof InvalidPathError) {
    console.error(
      prefix +
        chalk.red('❌ Invalid Path') +
        '\n' +
        chalk.yellow(`   ${error.message}`) +
        '\n' +
        chalk.gray('   Please provide a valid directory path.')
    );
  } else if (error instanceof ConfigurationError) {
    console.error(
      prefix +
        chalk.red('❌ Configuration Error') +
        '\n' +
        chalk.yellow(`   ${error.message}`)
    );
  } else if (error instanceof Error) {
    console.error(
      prefix +
        chalk.red('❌ Error') +
        '\n' +
        chalk.yellow(`   ${error.message}`)
    );
    if (process.env.DEBUG) {
      console.error(chalk.gray('\nStack trace:'));
      console.error(chalk.gray(error.stack));
    }
  } else {
    console.error(
      prefix + chalk.red('❌ An unexpected error occurred') + '\n' + chalk.yellow(String(error))
    );
  }
}
export function validatePath(path: string): string {
  if (!path || path.trim().length === 0) {
    throw new InvalidPathError('Path cannot be empty');
  }
  const normalized = path.trim();
  if (normalized.includes('\0')) {
    throw new InvalidPathError('Path contains invalid characters');
  }
  return normalized;
}
export function validateTimeString(timeString: string): void {
  const trimmed = timeString.trim().toLowerCase();
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*([hm])$/);
  if (!match) {
    throw new InvalidTimeFormatError(timeString);
  }
}
