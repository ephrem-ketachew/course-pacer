import type { VideoFile } from '../../models/video.js';
import type { CourseConfig } from '../../models/course.js';
import {
  adjustDurationForSpeed,
  calculatePracticeTime,
} from '../../utils/time-utils.js';
export interface CalculatedVideoTime {
  video: VideoFile;
  adjustedVideoTime: number;
  practiceTime: number;
  totalTime: number;
}
export function calculateVideoTime(
  video: VideoFile,
  config: CourseConfig
): CalculatedVideoTime {
  const adjustedVideoTime = adjustDurationForSpeed(
    video.duration,
    config.playbackSpeed
  );
  const multiplier =
    video.section && config.folderMultipliers[video.section] !== undefined
      ? config.folderMultipliers[video.section]!
      : config.defaultPracticeMultiplier;
  const practiceTime = calculatePracticeTime(adjustedVideoTime, multiplier);
  const totalTime = adjustedVideoTime + practiceTime;
  return {
    video,
    adjustedVideoTime,
    practiceTime,
    totalTime,
  };
}
export function calculateVideoTimes(
  videos: VideoFile[],
  config: CourseConfig
): CalculatedVideoTime[] {
  return videos.map((video) => calculateVideoTime(video, config));
}
export function calculateTotalTime(
  videos: VideoFile[],
  config: CourseConfig
): {
  totalVideoTime: number;
  totalPracticeTime: number;
  totalTime: number;
} {
  const calculated = calculateVideoTimes(videos, config);
  const totalVideoTime = calculated.reduce(
    (sum, calc) => sum + calc.adjustedVideoTime,
    0
  );
  const totalPracticeTime = calculated.reduce(
    (sum, calc) => sum + calc.practiceTime,
    0
  );
  const totalTime = calculated.reduce((sum, calc) => sum + calc.totalTime, 0);
  return {
    totalVideoTime,
    totalPracticeTime,
    totalTime,
  };
}
