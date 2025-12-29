import { scanForVideos, detectChanges } from '../../core/scanner/index.js';
import {
  getCourseByPath,
  saveCourse,
} from '../../storage/database.js';
import { createHash } from 'crypto';
import ora from 'ora';
import chalk from 'chalk';
import { formatSecondsShort } from '../../utils/time-utils.js';
import { CourseConfigSchema } from '../../models/course.js';
import type { Course } from '../../models/course.js';
import type { ScanResult } from '../../core/scanner/video-scanner.js';
import { handleError } from '../../utils/error-handler.js';
import { detectGaps, formatGapWarning } from '../../core/gamification/gap-detector.js';
import { updateStreak } from '../../core/gamification/streak-tracker.js';
function generateCourseId(rootPath: string): string {
  return createHash('sha256').update(rootPath).digest('hex').substring(0, 16);
}
import { existsSync } from 'fs';

export async function executeScan(
  path: string,
  options: { force?: boolean; quiet?: boolean }
): Promise<void> {
  const spinner = ora('Scanning directory...').start();
  try {
    if (!existsSync(path)) {
      throw new Error(`Directory does not exist: ${path}`);
    }
    const existingCourse = await getCourseByPath(path);
    if (existingCourse && !options.force) {
      spinner.info(
        `Course already exists: ${existingCourse.id}\nUse --force to re-scan`
      );
      return;
    }
    spinner.text = 'Discovering video files...';
    const scanResult = await scanForVideos({
      rootPath: path,
      onProgress: (current, _total, filename) => {
        if (!options.quiet) {
          spinner.text = chalk.gray(`Scanning... ${chalk.cyan(current)} videos found (${chalk.yellow(filename)})`);
        }
      },
      onError: (error, file) => {
        if (!options.quiet) {
          spinner.warn(`Error processing ${file}: ${error.message}`);
        }
      },
    });
    spinner.text = chalk.gray('Extracting metadata...');
    spinner.succeed(chalk.green(`✓ Found ${chalk.cyan(scanResult.videos.length)} video files`));
    let changes = null;
    if (existingCourse) {
      spinner.start(chalk.gray('Detecting changes...'));
      changes = await detectChanges(existingCourse.videos, scanResult.videos);
      spinner.succeed(chalk.green('✓ Changes detected'));
    }
    const courseId = existingCourse?.id ?? generateCourseId(path);
    const course: Course = {
      id: courseId,
      rootPath: path,
      scannedAt: new Date(),
      videos: scanResult.videos,
      progress: existingCourse?.progress ?? {},
      config: existingCourse?.config ?? CourseConfigSchema.parse({
        playbackSpeed: 1.0,
        defaultPracticeMultiplier: 1.0,
        folderMultipliers: {},
      }),
      checkpoint: existingCourse?.checkpoint,
    };
    spinner.start(chalk.gray('Saving to database...'));
    await saveCourse(course);
    spinner.succeed(chalk.green('✓ Course saved successfully'));
    const watchedCount = Object.values(course.progress).filter((p) => p.watched).length;
    if (watchedCount > 0) {
      await updateStreak();
    }
    const gapDetection = detectGaps(course);
    if (gapDetection.hasGaps && !options.quiet) {
      console.log('\n' + chalk.yellow(formatGapWarning(gapDetection)));
    }
    displayScanSummary(scanResult, changes, options.quiet);
    if (scanResult.errors.length > 0 && !options.quiet) {
      console.log(
        chalk.yellow(`\n⚠️  ${scanResult.errors.length} errors encountered`)
      );
    }
  } catch (error) {
    spinner.fail(chalk.red('✗ Scan failed'));
    handleError(error, 'scan');
    process.exit(1);
  }
}
function displayScanSummary(
  result: ScanResult,
  changes: { added: unknown[]; removed: string[]; modified: unknown[] } | null,
  quiet: boolean | undefined
): void {
  if (quiet) {
    return;
  }
  console.log('\n' + chalk.bold('📊 Scan Summary'));
  console.log('─'.repeat(50));
  console.log(`Total Videos: ${chalk.cyan(result.videos.length)}`);
  console.log(
    `Total Duration: ${chalk.cyan(formatSecondsShort(result.totalDuration))}`
  );
  console.log(
    `Total Size: ${chalk.cyan(formatBytes(result.totalSize))}`
  );
  console.log(`Sections: ${chalk.cyan(result.sections.length)}`);
  if (changes) {
    console.log('\n' + chalk.bold('🔄 Changes Detected'));
    console.log('─'.repeat(50));
    if (changes.added.length > 0) {
      console.log(
        `${chalk.green('+')} Added: ${chalk.green(changes.added.length)} videos`
      );
    }
    if (changes.removed.length > 0) {
      console.log(
        `${chalk.red('-')} Removed: ${chalk.red(changes.removed.length)} videos`
      );
    }
    if (changes.modified.length > 0) {
      console.log(
        `${chalk.yellow('~')} Modified: ${chalk.yellow(changes.modified.length)} videos`
      );
    }
    if (
      changes.added.length === 0 &&
      changes.removed.length === 0 &&
      changes.modified.length === 0
    ) {
      console.log(chalk.gray('No changes detected'));
    }
  }
  if (result.sections.length > 0) {
    console.log('\n' + chalk.bold('📁 Sections'));
    console.log('─'.repeat(50));
    for (const section of result.sections.slice(0, 10)) {
      const sectionVideos = result.videos.filter((v) => v.section === section);
      const sectionDuration = sectionVideos.reduce(
        (sum, v) => sum + v.duration,
        0
      );
      console.log(
        `  ${chalk.cyan(section)}: ${sectionVideos.length} videos, ${formatSecondsShort(sectionDuration)}`
      );
    }
    if (result.sections.length > 10) {
      console.log(
        chalk.gray(`  ... and ${result.sections.length - 10} more sections`)
      );
    }
  }
}
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
