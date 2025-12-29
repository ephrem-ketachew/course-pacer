import type {
  Course,
  CourseProgress,
  SectionProgress,
} from '../../models/course.js';
import type { VideoFile, VideoProgress } from '../../models/video.js';
import { adjustDurationForSpeed } from '../../utils/time-utils.js';
export function calculateCourseProgress(
  course: Course,
  playbackSpeed?: number
): CourseProgress {
  const videos = course.videos;
  const progress = course.progress;
  const watchedVideos = videos.filter((v) => progress[v.id]?.watched ?? false);
  const watchedCount = watchedVideos.length;
  const totalCount = videos.length;
  let totalDuration = 0;
  let watchedDuration = 0;
  const speed = playbackSpeed ?? course.config.playbackSpeed;
  for (const video of videos) {
    const adjustedDuration = adjustDurationForSpeed(video.duration, speed);
    totalDuration += adjustedDuration;
    if (progress[video.id]?.watched) {
      watchedDuration += adjustedDuration;
    }
  }
  const remainingDuration = totalDuration - watchedDuration;
  const completionPercentage =
    totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;
  let lastWatchedVideo: string | undefined;
  let lastWatchedTime: Date | undefined;
  for (const [videoId, videoProgress] of Object.entries(progress)) {
    if (videoProgress.watched && videoProgress.watchedAt) {
      if (!lastWatchedTime || videoProgress.watchedAt > lastWatchedTime) {
        lastWatchedTime = videoProgress.watchedAt;
        lastWatchedVideo = videoId;
      }
    }
  }
  const sectionProgress: Record<string, SectionProgress> = {};
  const sections = new Set<string>();
  for (const video of videos) {
    if (video.section) {
      sections.add(video.section);
    }
  }
  for (const section of sections) {
    const sectionVideos = videos.filter((v) => v.section === section);
    const sectionWatched = sectionVideos.filter(
      (v) => progress[v.id]?.watched ?? false
    );
    sectionProgress[section] = {
      totalVideos: sectionVideos.length,
      watchedVideos: sectionWatched.length,
      completionPercentage:
        sectionVideos.length > 0
          ? Math.round((sectionWatched.length / sectionVideos.length) * 100)
          : 0,
    };
  }
  return {
    totalVideos: totalCount,
    watchedVideos: watchedCount,
    completionPercentage,
    totalDuration,
    watchedDuration,
    remainingDuration,
    lastWatchedVideo,
    sectionProgress,
  };
}
export function getVideoProgress(
  course: Course,
  videoId: string
): VideoProgress | null {
  return course.progress[videoId] ?? null;
}
export function isVideoWatched(course: Course, videoId: string): boolean {
  return course.progress[videoId]?.watched ?? false;
}
export function getNextUnwatchedVideo(course: Course): VideoFile | null {
  for (const video of course.videos) {
    if (!course.progress[video.id]?.watched) {
      return video;
    }
  }
  return null;
}
export function getLastWatchedVideo(course: Course): VideoFile | null {
  let lastWatched: VideoFile | null = null;
  let lastWatchedTime: Date | undefined;
  for (const video of course.videos) {
    const progress = course.progress[video.id];
    if (progress?.watched && progress.watchedAt) {
      if (!lastWatchedTime || progress.watchedAt > lastWatchedTime) {
        lastWatchedTime = progress.watchedAt;
        lastWatched = video;
      }
    }
  }
  return lastWatched;
}
export function getCheckpointVideo(course: Course): VideoFile | null {
  if (course.checkpoint) {
    const checkpointVideo = course.videos.find(
      (v) => v.id === course.checkpoint
    );
    if (checkpointVideo) {
      return checkpointVideo;
    }
  }
  const lastWatched = getLastWatchedVideo(course);
  if (lastWatched) {
    return lastWatched;
  }
  return course.videos[0] ?? null;
}
