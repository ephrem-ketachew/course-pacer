import { listCourses, getCourseByPath } from '../../storage/database.js';
import {
  calculateCourseProgress,
  getCheckpointVideo,
  getLastWatchedVideo,
} from '../../core/tracker/progress-tracker.js';
import { analyzeCourse } from '../../core/analyzer/directory-analyzer.js';
import chalk from 'chalk';
import { formatSecondsShort } from '../../utils/time-utils.js';
import { table as createTable } from 'table';
import { handleError, CourseNotFoundError } from '../../utils/error-handler.js';
import { getStreak, isStreakAtRisk } from '../../core/gamification/streak-tracker.js';
import { checkAchievements, getMotivationalMessage } from '../../core/gamification/achievements.js';
import { detectGaps, formatGapWarning } from '../../core/gamification/gap-detector.js';
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
function createProgressBar(percentage: number, width: number = 30): string {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}
export async function executeStatus(
  coursePath?: string,
  options: { detailed?: boolean; json?: boolean } = {}
): Promise<void> {
  try {
    let course;
    if (coursePath) {
      course = await getCourseByPath(coursePath);
      if (!course) {
        throw new CourseNotFoundError(coursePath);
      }
    } else {
      const courses = await listCourses();
      if (courses.length === 0) {
        console.log(chalk.yellow('No courses found. Run "pacer scan <path>" to add a course.'));
        return;
      }
      if (courses.length === 1) {
        course = courses[0];
      } else {
        displayAllCoursesStatus(courses, options);
        return;
      }
    }
    if (!course) {
      console.error(chalk.red('No course found'));
      process.exit(1);
    }
    if (options.json) {
      const progress = calculateCourseProgress(course);
      console.log(JSON.stringify({ course, progress }, null, 2));
      return;
    }
    await displayCourseStatus(course, options.detailed ?? false);
  } catch (error) {
    handleError(error, 'status');
    process.exit(1);
  }
}
async function displayCourseStatus(course: Course, detailed: boolean): Promise<void> {
  const progress = calculateCourseProgress(course);
  const checkpointVideo = getCheckpointVideo(course);
  const lastWatchedVideo = getLastWatchedVideo(course);
  const streak = await getStreak();
  const achievements = await checkAchievements(course);
  const motivationalMessage = getMotivationalMessage(progress, streak);
  const gapDetection = detectGaps(course);
  console.log('\n' + chalk.bold('📊 Course Status'));
  console.log('═'.repeat(60));
  console.log(`${chalk.cyan('Course:')} ${course.rootPath}`);
  console.log(`${chalk.cyan('Scanned:')} ${course.scannedAt.toLocaleDateString()}`);
  if (streak.current > 0) {
    const streakEmoji = streak.current >= 7 ? '🔥' : streak.current >= 3 ? '💪' : '✨';
    console.log(
      `\n${chalk.bold('Streak:')} ${streakEmoji} ${chalk.yellow(streak.current)} days (Longest: ${chalk.cyan(streak.longest)})`
    );
    if (await isStreakAtRisk()) {
      console.log(chalk.yellow('  ⚠️  Your streak is at risk! Study today to keep it going.'));
    }
  }
  if (achievements.length > 0) {
    console.log('\n' + chalk.bold('🏆 Achievements:'));
    for (const achievement of achievements) {
      console.log(`  ${achievement.emoji} ${chalk.green(achievement.name)} - ${achievement.description}`);
    }
  }
  if (motivationalMessage) {
    console.log('\n' + chalk.bold('💬 ' + motivationalMessage));
  }
  if (gapDetection.hasGaps) {
    console.log('\n' + chalk.yellow(formatGapWarning(gapDetection)));
  }
  const analysis = analyzeCourse(course);
  console.log('\n' + chalk.bold('Overall Progress'));
  console.log('─'.repeat(60));
  console.log(
    `Completion: ${chalk.green(progress.completionPercentage + '%')} ${createProgressBar(progress.completionPercentage)}`
  );
  console.log(
    `Videos: ${chalk.cyan(progress.watchedVideos)}/${chalk.cyan(progress.totalVideos)} watched`
  );
  console.log(
    `Duration: ${chalk.cyan(formatSecondsShort(progress.watchedDuration))} / ${chalk.cyan(formatSecondsShort(progress.totalDuration))}`
  );
  console.log(
    `Remaining: ${chalk.yellow(formatSecondsShort(progress.remainingDuration))}`
  );
  console.log(`Total Size: ${chalk.cyan(formatBytes(analysis.totalSize))}`);
  console.log(
    `Average Video Duration: ${chalk.cyan(formatSecondsShort(analysis.averageVideoDuration))}`
  );
  if (lastWatchedVideo) {
    console.log(
      `\n${chalk.bold('Last Watched:')} ${chalk.cyan(lastWatchedVideo.filename)}`
    );
    if (lastWatchedVideo.section) {
      console.log(`  Section: ${chalk.gray(lastWatchedVideo.section)}`);
    }
  }
  if (checkpointVideo && checkpointVideo !== lastWatchedVideo) {
    console.log(
      `\n${chalk.bold('Checkpoint:')} ${chalk.cyan(checkpointVideo.filename)}`
    );
  }
  if (detailed) {
    displaySectionProgress(progress);
    displayFormatBreakdown(analysis);
    displayVideoStatistics(analysis);
  }
  console.log('');
}
function displayFormatBreakdown(analysis: {
  formats: Record<string, { count: number; totalDuration: number; totalSize: number }>;
}): void {
  const formats = Object.entries(analysis.formats);
  if (formats.length === 0) {
    return;
  }
  console.log('\n' + chalk.bold('Video Formats'));
  console.log('─'.repeat(60));
  const formatTable = [['Format', 'Count', 'Duration', 'Size']];
  for (const [format, data] of formats) {
    formatTable.push([
      format,
      data.count.toString(),
      formatSecondsShort(data.totalDuration),
      formatBytes(data.totalSize),
    ]);
  }
  console.log(createTable(formatTable));
}
function displayVideoStatistics(analysis: {
  longestVideo: { filename: string; duration: number } | null;
  shortestVideo: { filename: string; duration: number } | null;
}): void {
  console.log('\n' + chalk.bold('Video Statistics'));
  console.log('─'.repeat(60));
  if (analysis.longestVideo) {
    console.log(
      `Longest: ${chalk.cyan(analysis.longestVideo.filename)} (${formatSecondsShort(analysis.longestVideo.duration)})`
    );
  }
  if (analysis.shortestVideo) {
    console.log(
      `Shortest: ${chalk.cyan(analysis.shortestVideo.filename)} (${formatSecondsShort(analysis.shortestVideo.duration)})`
    );
  }
}
function displaySectionProgress(progress: CourseProgress): void {
  const sections = Object.entries(progress.sectionProgress);
  if (sections.length === 0) {
    return;
  }
  console.log('\n' + chalk.bold('Section Progress'));
  console.log('─'.repeat(60));
  const tableData = [
    ['Section', 'Progress', 'Videos', 'Status'],
  ];
  for (const [section, sectionProgress] of sections) {
    const progressBar = createProgressBar(sectionProgress.completionPercentage, 20);
    const status =
      sectionProgress.completionPercentage === 100
        ? chalk.green('✓ Complete')
        : sectionProgress.completionPercentage > 0
        ? chalk.yellow('In Progress')
        : chalk.gray('Not Started');
    tableData.push([
      section,
      `${sectionProgress.completionPercentage}% ${progressBar}`,
      `${sectionProgress.watchedVideos}/${sectionProgress.totalVideos}`,
      status,
    ]);
  }
  console.log(createTable(tableData));
}
function displayAllCoursesStatus(
  courses: Course[],
  _options: { detailed?: boolean }
): void {
  console.log('\n' + chalk.bold('📚 All Courses'));
  console.log('═'.repeat(60));
  const tableData = [
    ['Course', 'Progress', 'Videos', 'Duration', 'Status'],
  ];
  for (const course of courses) {
    const progress = calculateCourseProgress(course);
    const progressBar = createProgressBar(progress.completionPercentage, 15);
    const status =
      progress.completionPercentage === 100
        ? chalk.green('Complete')
        : progress.completionPercentage > 0
        ? chalk.yellow('In Progress')
        : chalk.gray('Not Started');
    const displayPath =
      course.rootPath.length > 40
        ? '...' + course.rootPath.slice(-37)
        : course.rootPath;
    tableData.push([
      displayPath,
      `${progress.completionPercentage}% ${progressBar}`,
      `${progress.watchedVideos}/${progress.totalVideos}`,
      formatSecondsShort(progress.totalDuration),
      status,
    ]);
  }
  console.log(createTable(tableData));
  console.log(
    chalk.gray(`\nUse "pacer status <path>" to see detailed status for a specific course.`)
  );
}
import type { Course, CourseProgress } from '../../models/course.js';
