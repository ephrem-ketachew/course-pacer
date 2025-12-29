import type { Course, CourseConfig } from '../../models/course.js';
import {
  getCourse,
  saveCourse,
  getCourseByPath,
} from '../../storage/database.js';
import { CourseSchema, CourseConfigSchema } from '../../models/course.js';
import { safeParse } from '../../utils/validators.js';
export async function markVideoWatched(
  courseId: string,
  videoId: string,
  notes?: string
): Promise<void> {
  const course = await getCourse(courseId);
  if (!course) {
    throw new Error(`Course not found: ${courseId}`);
  }
  const video = course.videos.find((v) => v.id === videoId);
  if (!video) {
    throw new Error(`Video not found: ${videoId}`);
  }
  if (!course.progress) {
    course.progress = {};
  }
  course.progress[videoId] = {
    videoId,
    watched: true,
    watchedAt: new Date(),
    notes,
  };
  course.checkpoint = videoId;
  const config = CourseConfigSchema.parse(course.config);
  const result = safeParse(CourseSchema, { ...course, progress: course.progress, config });
  if (!result.success) {
    throw new Error(`Invalid course data: ${result.error}`);
  }
  await saveCourse(result.data);
}
export async function markVideoUnwatched(
  courseId: string,
  videoId: string
): Promise<void> {
  const course = await getCourse(courseId);
  if (!course) {
    throw new Error(`Course not found: ${courseId}`);
  }
  if (!course.progress) {
    course.progress = {};
  }
  if (course.progress[videoId]) {
    course.progress[videoId] = {
      ...course.progress[videoId],
      watched: false,
      watchedAt: undefined,
    };
  }
  const config = CourseConfigSchema.parse(course.config);
  const result = safeParse(CourseSchema, { ...course, progress: course.progress, config });
  if (!result.success) {
    throw new Error(`Invalid course data: ${result.error}`);
  }
  await saveCourse(result.data);
}
export async function toggleVideoWatched(
  courseId: string,
  videoId: string
): Promise<boolean> {
  const course = await getCourse(courseId);
  if (!course) {
    throw new Error(`Course not found: ${courseId}`);
  }
  if (!course.progress) {
    course.progress = {};
  }
  const isWatched = course.progress[videoId]?.watched ?? false;
  if (isWatched) {
    await markVideoUnwatched(courseId, videoId);
    return false;
  } else {
    await markVideoWatched(courseId, videoId);
    return true;
  }
}
export async function updateVideoNotes(
  courseId: string,
  videoId: string,
  notes: string
): Promise<void> {
  const course = await getCourse(courseId);
  if (!course) {
    throw new Error(`Course not found: ${courseId}`);
  }
  if (!course.progress) {
    course.progress = {};
  }
  if (!course.progress[videoId]) {
    course.progress[videoId] = {
      videoId,
      watched: false,
    };
  }
  course.progress[videoId] = {
    ...course.progress[videoId],
    notes,
  };
  const config = CourseConfigSchema.parse(course.config);
  const result = safeParse(CourseSchema, { ...course, progress: course.progress, config });
  if (!result.success) {
    throw new Error(`Invalid course data: ${result.error}`);
  }
  await saveCourse(result.data);
}
export async function markSectionVideos(
  courseId: string,
  section: string,
  watched: boolean
): Promise<number> {
  const course = await getCourse(courseId);
  if (!course) {
    throw new Error(`Course not found: ${courseId}`);
  }
  if (!course.progress) {
    course.progress = {};
  }
  const sectionVideos = course.videos.filter((v) => v.section === section);
  let count = 0;
  for (const video of sectionVideos) {
    if (watched) {
      if (!course.progress[video.id]?.watched) {
        await markVideoWatched(courseId, video.id);
        count++;
      }
    } else {
      if (course.progress[video.id]?.watched) {
        await markVideoUnwatched(courseId, video.id);
        count++;
      }
    }
  }
  return count;
}
export async function markVideosUpTo(
  courseId: string,
  targetVideoId: string,
  watched: boolean
): Promise<number> {
  const course = await getCourse(courseId);
  if (!course) {
    throw new Error(`Course not found: ${courseId}`);
  }
  const targetVideo = course.videos.find((v) => v.id === targetVideoId);
  if (!targetVideo) {
    throw new Error(`Video not found: ${targetVideoId}`);
  }
  const targetIndex = course.videos.findIndex((v) => v.id === targetVideoId);
  if (targetIndex === -1) {
    throw new Error(`Video not found in course: ${targetVideoId}`);
  }
  const videosToMark = course.videos.slice(0, targetIndex + 1);
  let count = 0;
  for (const video of videosToMark) {
    if (watched) {
      if (!course.progress[video.id]?.watched) {
        await markVideoWatched(courseId, video.id);
        count++;
      }
    } else {
      if (course.progress[video.id]?.watched) {
        await markVideoUnwatched(courseId, video.id);
        count++;
      }
    }
  }
  return count;
}
export async function updateCourseConfig(
  courseId: string,
  config: Partial<CourseConfig>
): Promise<void> {
  const course = await getCourse(courseId);
  if (!course) {
    throw new Error(`Course not found: ${courseId}`);
  }
  const updatedConfig = {
    ...course.config,
    ...config,
  };
  const parsedConfig = CourseConfigSchema.parse(updatedConfig);
  if (!course.progress) {
    course.progress = {};
  }
  const result = safeParse(CourseSchema, { ...course, progress: course.progress, config: parsedConfig });
  if (!result.success) {
    throw new Error(`Invalid course data: ${result.error}`);
  }
  await saveCourse(result.data);
}
export async function setCheckpoint(
  courseId: string,
  videoId: string
): Promise<void> {
  const course = await getCourse(courseId);
  if (!course) {
    throw new Error(`Course not found: ${courseId}`);
  }
  const video = course.videos.find((v) => v.id === videoId);
  if (!video) {
    throw new Error(`Video not found: ${videoId}`);
  }
  course.checkpoint = videoId;
  if (!course.progress) {
    course.progress = {};
  }
  const config = CourseConfigSchema.parse(course.config);
  const result = safeParse(CourseSchema, { ...course, progress: course.progress, config });
  if (!result.success) {
    throw new Error(`Invalid course data: ${result.error}`);
  }
  await saveCourse(result.data);
}
export async function findCourseByVideo(
  videoIdOrPath: string
): Promise<Course | null> {
  const courses = await import('../../storage/database.js').then((m) =>
    m.listCourses()
  );
  for (const course of courses) {
    const video = course.videos.find(
      (v) => v.id === videoIdOrPath || v.filename === videoIdOrPath
    );
    if (video) {
      return course;
    }
  }
  return getCourseByPath(videoIdOrPath);
}
