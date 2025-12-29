import type { Course } from '../../models/course.js';
import type { VideoFile } from '../../models/video.js';
import { getCheckpointVideo, getLastWatchedVideo } from '../tracker/progress-tracker.js';
import { setCheckpoint } from '../tracker/state-manager.js';
export function getCheckpoint(course: Course): VideoFile | null {
  return getCheckpointVideo(course);
}
export async function setCheckpointToVideo(
  courseId: string,
  videoId: string
): Promise<void> {
  await setCheckpoint(courseId, videoId);
}
export async function setCheckpointToLast(
  courseId: string
): Promise<void> {
  const { getCourse } = await import('../../storage/database.js');
  const course = await getCourse(courseId);
  if (!course) {
    throw new Error(`Course not found: ${courseId}`);
  }
  const lastWatched = getLastWatchedVideo(course);
  if (!lastWatched) {
    throw new Error('No watched videos found');
  }
  await setCheckpoint(courseId, lastWatched.id);
}
export async function resetCheckpoint(courseId: string): Promise<void> {
  const { getCourse } = await import('../../storage/database.js');
  const course = await getCourse(courseId);
  if (!course) {
    throw new Error(`Course not found: ${courseId}`);
  }
  const firstVideo = course.videos[0];
  if (!firstVideo) {
    throw new Error('Course has no videos');
  }
  await setCheckpoint(courseId, firstVideo.id);
}
export function validateCheckpoint(course: Course): boolean {
  if (!course.checkpoint) {
    return true; 
  }
  return course.videos.some((v) => v.id === course.checkpoint);
}
