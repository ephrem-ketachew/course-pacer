import { z } from 'zod';
export const UserConfigSchema = z.object({
  playbackSpeed: z.number().min(0.5).max(3.0).default(1.5),
  defaultPracticeMultiplier: z.number().min(0).max(10).default(1.0),
  folderMultipliers: z.record(z.string(), z.number()).default({}),
  theme: z.enum(['light', 'dark']).optional(),
  notifications: z.boolean().optional().default(true),
});
export type UserConfig = z.infer<typeof UserConfigSchema>;
export const DatabaseSchema = z.object({
  version: z.string(),
  courses: z.record(z.string(), z.any()),
  globalConfig: UserConfigSchema,
  analytics: z
    .object({
      streaks: z
        .object({
          current: z.number().int().nonnegative(),
          longest: z.number().int().nonnegative(),
          lastStudyDate: z.string().optional(),
        })
        .optional(),
      sessions: z
        .array(
          z.object({
            date: z.string(),
            duration: z.number().nonnegative(),
            videosWatched: z.number().int().nonnegative(),
          })
        )
        .optional(),
    })
    .optional(),
});
export type Database = z.infer<typeof DatabaseSchema>;
