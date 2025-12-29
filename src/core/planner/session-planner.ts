import type { Course } from '../../models/course.js';
import type { SessionPlan } from '../../models/session.js';
import type { VideoFile } from '../../models/video.js';
import {
  calculateVideoTime,
  calculateTotalTime,
  type CalculatedVideoTime,
} from './time-calculator.js';
import { getCheckpointVideo } from '../tracker/progress-tracker.js';
export interface PlanningOptions {
  timeBudget: number;
  startFrom?: 'last' | 'beginning' | 'checkpoint' | string;
  section?: string;
  includePractice?: boolean;
}
export function generateSessionPlan(
  course: Course,
  options: PlanningOptions
): SessionPlan {
  const startVideo = getStartVideo(course, options.startFrom);
  if (!startVideo) {
    throw new Error('No starting video found');
  }
  let candidateVideos = course.videos;
  const startIndex = candidateVideos.findIndex((v) => v.id === startVideo.id);
  if (startIndex >= 0) {
    candidateVideos = candidateVideos.slice(startIndex);
  }
  candidateVideos = candidateVideos.filter(
    (v) => !course.progress[v.id]?.watched
  );
  if (options.section) {
    candidateVideos = candidateVideos.filter(
      (v) => v.section === options.section
    );
  }
  if (candidateVideos.length === 0) {
    throw new Error('No unwatched videos found');
  }
  const calculatedVideos = candidateVideos.map((video) =>
    calculateVideoTime(video, course.config)
  );
  const playlist = generatePlaylist(
    calculatedVideos,
    options.timeBudget,
    options.includePractice !== false
  );
  const totals = calculateTotalTime(
    playlist.map((cv) => cv.video),
    course.config
  );
  const includePractice = options.includePractice !== false;
  return {
    videos: playlist.map((cv) => cv.video),
    totalVideoTime: totals.totalVideoTime,
    totalPracticeTime: includePractice ? totals.totalPracticeTime : 0,
    totalTime: includePractice ? totals.totalTime : totals.totalVideoTime,
    startCheckpoint: startVideo.id,
    endCheckpoint: playlist[playlist.length - 1]?.video.id ?? startVideo.id,
  };
}
function getStartVideo(
  course: Course,
  startFrom?: string
): VideoFile | null {
  if (!startFrom || startFrom === 'last') {
    const checkpoint = getCheckpointVideo(course);
    return checkpoint;
  }
  if (startFrom === 'beginning') {
    const firstUnwatched = course.videos.find(
      (v) => !course.progress[v.id]?.watched
    );
    return firstUnwatched ?? course.videos[0] ?? null;
  }
  if (startFrom === 'checkpoint') {
    if (course.checkpoint) {
      const checkpointVideo = course.videos.find(
        (v) => v.id === course.checkpoint
      );
      if (checkpointVideo) {
        return checkpointVideo;
      }
    }
    return getCheckpointVideo(course);
  }
  const video = course.videos.find((v) => v.id === startFrom);
  return video ?? null;
}
function generatePlaylist(
  calculatedVideos: CalculatedVideoTime[],
  timeBudget: number,
  includePractice: boolean
): CalculatedVideoTime[] {
  const playlist: CalculatedVideoTime[] = [];
  let remainingBudget = timeBudget;
  for (const calculated of calculatedVideos) {
    const timeToAdd = includePractice
      ? calculated.totalTime
      : calculated.adjustedVideoTime;
    if (timeToAdd <= remainingBudget) {
      playlist.push(calculated);
      remainingBudget -= timeToAdd;
    } else {
      break;
    }
  }
  return playlist;
}
export function estimateVideosInBudget(
  course: Course,
  timeBudget: number,
  includePractice: boolean = true
): number {
  const unwatchedVideos = course.videos.filter(
    (v) => !course.progress[v.id]?.watched
  );
  if (unwatchedVideos.length === 0) {
    return 0;
  }
  const calculated = unwatchedVideos.map((video) =>
    calculateVideoTime(video, course.config)
  );
  let count = 0;
  let remainingBudget = timeBudget;
  for (const calc of calculated) {
    const timeToAdd = includePractice
      ? calc.totalTime
      : calc.adjustedVideoTime;
    if (timeToAdd <= remainingBudget) {
      count++;
      remainingBudget -= timeToAdd;
    } else {
      break;
    }
  }
  return count;
}
