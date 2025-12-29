import { z } from 'zod';
import { VideoFileSchema, VideoProgressSchema } from './video.js';
export const CourseConfigSchema = z.object({
  playbackSpeed: z.number().min(0.5).max(3.0).default(1.0),
  defaultPracticeMultiplier: z.number().min(0).max(10).default(1.0),
  folderMultipliers: z.record(z.string(), z.number()).default({}),
});
export type CourseConfig = z.infer<typeof CourseConfigSchema>;
export const CourseSchema = z.object({
  id: z.string(),
  rootPath: z.string(),
  scannedAt: z.date(),
  videos: z.array(VideoFileSchema),
  progress: z.record(z.string(), VideoProgressSchema).default({}),
  config: CourseConfigSchema,
  checkpoint: z.string().optional(),
});
export type Course = z.infer<typeof CourseSchema>;
export const SectionProgressSchema = z.object({
  totalVideos: z.number().int().nonnegative(),
  watchedVideos: z.number().int().nonnegative(),
  completionPercentage: z.number().min(0).max(100),
});
export type SectionProgress = z.infer<typeof SectionProgressSchema>;
export const CourseProgressSchema = z.object({
  totalVideos: z.number().int().nonnegative(),
  watchedVideos: z.number().int().nonnegative(),
  completionPercentage: z.number().min(0).max(100),
  totalDuration: z.number().nonnegative(),
  watchedDuration: z.number().nonnegative(),
  remainingDuration: z.number().nonnegative(),
  lastWatchedVideo: z.string().optional(),
  sectionProgress: z.record(z.string(), SectionProgressSchema),
});
export type CourseProgress = z.infer<typeof CourseProgressSchema>;
