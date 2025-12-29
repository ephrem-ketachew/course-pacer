import {
  markVideoWatched,
  markVideoUnwatched,
  toggleVideoWatched,
  updateVideoNotes,
  markSectionVideos,
  markVideosUpTo,
  findCourseByVideo,
} from '../../core/tracker/state-manager.js';
import { getCourseByPath } from '../../storage/database.js';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { handleError, VideoNotFoundError, CourseNotFoundError } from '../../utils/error-handler.js';
import { updateStreak } from '../../core/gamification/streak-tracker.js';
export async function executeMark(
  videoIdOrPath: string,
  options: {
    status?: 'watched' | 'unwatched';
    all?: boolean;
    section?: string;
    upTo?: boolean;
    notes?: string;
  }
): Promise<void> {
  try {
    if (options.section) {
      await handleSectionMarking(videoIdOrPath, options.section, options.status ?? 'watched');
      return;
    }
    if (options.all) {
      await handleBulkMarking(videoIdOrPath, options.status ?? 'watched');
      return;
    }
    const course = await findCourseByVideo(videoIdOrPath);
    if (!course) {
      throw new CourseNotFoundError(videoIdOrPath);
    }
    const video = course.videos.find(
      (v) => v.id === videoIdOrPath || v.filename === videoIdOrPath
    );
    if (!video) {
      throw new VideoNotFoundError(videoIdOrPath);
    }
    if (options.upTo) {
      await handleUpToMarking(course.id, video.id, options.status ?? 'watched');
      return;
    }
    if (options.status === 'watched') {
      await markVideoWatched(course.id, video.id, options.notes);
      await updateStreak();
      console.log(
        chalk.green(`✓ Marked "${video.filename}" as watched`)
      );
    } else if (options.status === 'unwatched') {
      await markVideoUnwatched(course.id, video.id);
      console.log(
        chalk.yellow(`○ Marked "${video.filename}" as unwatched`)
      );
    } else {
      const isWatched = await toggleVideoWatched(course.id, video.id);
      if (isWatched) {
        await updateStreak();
      }
      const status = isWatched ? chalk.green('watched') : chalk.yellow('unwatched');
      console.log(`✓ Toggled "${video.filename}" to ${status}`);
    }
    if (options.notes && options.status !== 'watched') {
      await updateVideoNotes(course.id, video.id, options.notes);
      console.log(chalk.gray(`  Notes updated`));
    }
  } catch (error) {
    handleError(error, 'mark');
    process.exit(1);
  }
}
async function handleSectionMarking(
  coursePath: string,
  section: string,
  status: 'watched' | 'unwatched'
): Promise<void> {
  const course = await getCourseByPath(coursePath);
  if (!course) {
    console.error(chalk.red(`Course not found: ${coursePath}`));
    process.exit(1);
  }
  const sections = new Set(course.videos.map((v) => v.section).filter(Boolean));
  if (!sections.has(section)) {
    console.error(chalk.red(`Section not found: ${section}`));
    console.log(chalk.gray(`Available sections: ${Array.from(sections).join(', ')}`));
    process.exit(1);
  }
  const count = await markSectionVideos(course.id, section, status === 'watched');
  if (status === 'watched' && count > 0) {
    await updateStreak();
  }
  const action = status === 'watched' ? 'watched' : 'unwatched';
  console.log(
    chalk.green(`✓ Marked ${count} videos in "${section}" as ${action}`)
  );
}
async function handleBulkMarking(
  coursePath: string,
  status: 'watched' | 'unwatched'
): Promise<void> {
  const course = await getCourseByPath(coursePath);
  if (!course) {
    console.error(chalk.red(`Course not found: ${coursePath}`));
    process.exit(1);
  }
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to mark ALL ${course.videos.length} videos as ${status}?`,
      default: false,
    },
  ]);
  if (!confirm) {
    console.log(chalk.yellow('Operation cancelled'));
    return;
  }
  let count = 0;
  for (const video of course.videos) {
    if (status === 'watched') {
      await markVideoWatched(course.id, video.id);
    } else {
      await markVideoUnwatched(course.id, video.id);
    }
    count++;
  }
  if (status === 'watched' && count > 0) {
    await updateStreak();
  }
  console.log(
    chalk.green(`✓ Marked ${count} videos as ${status}`)
  );
}
async function handleUpToMarking(
  courseId: string,
  targetVideoId: string,
  status: 'watched' | 'unwatched'
): Promise<void> {
  const count = await markVideosUpTo(courseId, targetVideoId, status === 'watched');
  if (status === 'watched' && count > 0) {
    await updateStreak();
  }
  const action = status === 'watched' ? 'watched' : 'unwatched';
  console.log(
    chalk.green(`✓ Marked ${count} videos up to target as ${action}`)
  );
}
