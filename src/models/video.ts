import { z } from 'zod';
export const VideoFileSchema = z.object({
  id: z.string(),
  path: z.string(),
  relativePath: z.string(),
  filename: z.string(),
  duration: z.number().nonnegative(),
  size: z.number().nonnegative(),
  format: z.string(),
  lastModified: z.date(),
  section: z.string().optional(),
  order: z.number().int().nonnegative(),
});
export type VideoFile = z.infer<typeof VideoFileSchema>;
export const VideoProgressSchema = z.object({
  videoId: z.string(),
  watched: z.boolean(),
  watchedAt: z.date().optional(),
  notes: z.string().optional(),
  lastPosition: z.number().nonnegative().optional(),
});
export type VideoProgress = z.infer<typeof VideoProgressSchema>;
