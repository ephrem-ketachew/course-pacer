import { findCourseByVideo, getCourseByPath } from '../../storage/database.js';
import { launchVideo } from '../../core/workflow/video-launcher.js';
import chalk from 'chalk';
import { handleError, VideoNotFoundError } from '../../utils/error-handler.js';
export async function executeLaunch(
  videoIdOrPath: string,
  coursePath?: string
): Promise<void> {
  try {
    let course;
    let video;
    if (coursePath) {
      course = await getCourseByPath(coursePath);
      if (!course) {
        throw new Error(`Course not found: ${coursePath}`);
      }
      video = course.videos.find(
        (v) => v.id === videoIdOrPath || v.filename === videoIdOrPath
      );
    } else {
      course = await findCourseByVideo(videoIdOrPath);
      if (!course) {
        throw new Error(`Video or course not found: ${videoIdOrPath}`);
      }
      video = course.videos.find(
        (v) => v.id === videoIdOrPath || v.filename === videoIdOrPath
      );
    }
    if (!video) {
      throw new VideoNotFoundError(videoIdOrPath);
    }
    console.log(chalk.cyan(`🎬 Launching: ${video.filename}...`));
    await launchVideo(video);
    console.log(chalk.green('✓ Video launched successfully'));
  } catch (error) {
    handleError(error, 'launch');
    process.exit(1);
  }
}
