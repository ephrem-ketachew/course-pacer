import { z } from 'zod';
import { VideoFileSchema } from './video.js';
export const SessionPlanSchema = z.object({
  videos: z.array(VideoFileSchema),
  totalVideoTime: z.number().nonnegative(),
  totalPracticeTime: z.number().nonnegative(),
  totalTime: z.number().nonnegative(),
  startCheckpoint: z.string(),
  endCheckpoint: z.string(),
});
export type SessionPlan = z.infer<typeof SessionPlanSchema>;
export const PlanningConfigSchema = z.object({
  playbackSpeed: z.number().min(0.5).max(3.0),
  practiceMultipliers: z.record(z.string(), z.number()),
  defaultPracticeMultiplier: z.number().min(0).max(10),
});
export type PlanningConfig = z.infer<typeof PlanningConfigSchema>;
