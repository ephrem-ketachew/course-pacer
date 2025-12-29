import type { Course } from '../../models/course.js';
import { calculateCourseProgress } from '../tracker/progress-tracker.js';
import { adjustDurationForSpeed } from '../../utils/time-utils.js';
export interface AnalysisFilter {
  section?: string;
  watched?: boolean;
  format?: string;
}
export interface DirectoryAnalysis {
  totalVideos: number;
  totalDuration: number;
  adjustedDuration: number;
  totalSize: number;
  watchedVideos: number;
  unwatchedVideos: number;
  completionPercentage: number;
  sections: Array<{
    name: string;
    videoCount: number;
    totalDuration: number;
    watchedCount: number;
    completionPercentage: number;
  }>;
  formats: Record<string, {
    count: number;
    totalDuration: number;
    totalSize: number;
  }>;
  averageVideoDuration: number;
  longestVideo: {
    filename: string;
    duration: number;
  } | null;
  shortestVideo: {
    filename: string;
    duration: number;
  } | null;
}
export function analyzeCourse(
  course: Course,
  filter?: AnalysisFilter
): DirectoryAnalysis {
  let videos = course.videos;
  if (filter) {
    if (filter.section) {
      videos = videos.filter((v) => v.section === filter.section);
    }
    if (filter.watched !== undefined) {
      videos = videos.filter((v) => {
        const isWatched = course.progress[v.id]?.watched ?? false;
        return filter.watched ? isWatched : !isWatched;
      });
    }
    if (filter.format) {
      videos = videos.filter((v) => v.format === filter.format);
    }
  }
  if (videos.length === 0) {
    return {
      totalVideos: 0,
      totalDuration: 0,
      adjustedDuration: 0,
      totalSize: 0,
      watchedVideos: 0,
      unwatchedVideos: 0,
      completionPercentage: 0,
      sections: [],
      formats: {},
      averageVideoDuration: 0,
      longestVideo: null,
      shortestVideo: null,
    };
  }
  const totalDuration = videos.reduce((sum, v) => sum + v.duration, 0);
  const totalSize = videos.reduce((sum, v) => sum + v.size, 0);
  const adjustedDuration = videos.reduce(
    (sum, v) => sum + adjustDurationForSpeed(v.duration, course.config.playbackSpeed),
    0
  );
  const watchedVideos = videos.filter(
    (v) => course.progress[v.id]?.watched ?? false
  ).length;
  const unwatchedVideos = videos.length - watchedVideos;
  const completionPercentage =
    videos.length > 0 ? Math.round((watchedVideos / videos.length) * 100) : 0;
  const sectionMap = new Map<string, typeof videos>();
  for (const video of videos) {
    const section = video.section ?? 'Uncategorized';
    if (!sectionMap.has(section)) {
      sectionMap.set(section, []);
    }
    sectionMap.get(section)!.push(video);
  }
  const sections = Array.from(sectionMap.entries()).map(([name, sectionVideos]) => {
    const sectionWatched = sectionVideos.filter(
      (v) => course.progress[v.id]?.watched ?? false
    ).length;
    const sectionDuration = sectionVideos.reduce((sum, v) => sum + v.duration, 0);
    return {
      name,
      videoCount: sectionVideos.length,
      totalDuration: sectionDuration,
      watchedCount: sectionWatched,
      completionPercentage:
        sectionVideos.length > 0
          ? Math.round((sectionWatched / sectionVideos.length) * 100)
          : 0,
    };
  });
  const formatMap = new Map<
    string,
    { count: number; totalDuration: number; totalSize: number }
  >();
  for (const video of videos) {
    const format = video.format;
    if (!formatMap.has(format)) {
      formatMap.set(format, { count: 0, totalDuration: 0, totalSize: 0 });
    }
    const formatData = formatMap.get(format)!;
    formatData.count++;
    formatData.totalDuration += video.duration;
    formatData.totalSize += video.size;
  }
  const formats: Record<string, { count: number; totalDuration: number; totalSize: number }> =
    {};
  for (const [format, data] of formatMap.entries()) {
    formats[format] = data;
  }
  const sortedByDuration = [...videos].sort((a, b) => b.duration - a.duration);
  const longestVideo =
    sortedByDuration.length > 0
      ? {
          filename: sortedByDuration[0]!.filename,
          duration: sortedByDuration[0]!.duration,
        }
      : null;
  const shortestVideo =
    sortedByDuration.length > 0
      ? {
          filename: sortedByDuration[sortedByDuration.length - 1]!.filename,
          duration: sortedByDuration[sortedByDuration.length - 1]!.duration,
        }
      : null;
  const averageVideoDuration =
    videos.length > 0 ? Math.round(totalDuration / videos.length) : 0;
  return {
    totalVideos: videos.length,
    totalDuration,
    adjustedDuration,
    totalSize,
    watchedVideos,
    unwatchedVideos,
    completionPercentage,
    sections,
    formats,
    averageVideoDuration,
    longestVideo,
    shortestVideo,
  };
}
export function analyzeCourses(courses: Course[]): {
  totalCourses: number;
  totalVideos: number;
  totalDuration: number;
  totalWatchedVideos: number;
  averageCompletion: number;
  courses: Array<{
    path: string;
    videoCount: number;
    completionPercentage: number;
  }>;
} {
  let totalVideos = 0;
  let totalDuration = 0;
  let totalWatchedVideos = 0;
  let totalCompletion = 0;
  const courseAnalyses = courses.map((course) => {
    const progress = calculateCourseProgress(course);
    totalVideos += progress.totalVideos;
    totalDuration += progress.totalDuration;
    totalWatchedVideos += progress.watchedVideos;
    totalCompletion += progress.completionPercentage;
    return {
      path: course.rootPath,
      videoCount: progress.totalVideos,
      completionPercentage: progress.completionPercentage,
    };
  });
  const averageCompletion =
    courses.length > 0 ? Math.round(totalCompletion / courses.length) : 0;
  return {
    totalCourses: courses.length,
    totalVideos,
    totalDuration,
    totalWatchedVideos,
    averageCompletion,
    courses: courseAnalyses,
  };
}
