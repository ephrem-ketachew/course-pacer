import { differenceInDays, addDays } from 'date-fns';
import type { Course } from '../../models/course.js';
import { calculateCourseProgress } from '../tracker/progress-tracker.js';
export interface DeadlineCalculation {
  deadline: Date;
  daysRemaining: number;
  hoursRemaining: number;
  hoursPerDay: number;
  isAchievable: boolean;
  recommendation: string;
}
export function calculateDeadlineRequirements(
  course: Course,
  deadline: Date
): DeadlineCalculation {
  const progress = calculateCourseProgress(course);
  const hoursRemaining = progress.remainingDuration / 3600;
  const today = new Date();
  const daysRemaining = Math.max(1, differenceInDays(deadline, today));
  const hoursPerDay = hoursRemaining / daysRemaining;
  const adjustedHoursPerDay =
    hoursPerDay / course.config.playbackSpeed;
  const avgMultiplier =
    Object.keys(course.config.folderMultipliers).length > 0
      ? Object.values(course.config.folderMultipliers).reduce(
          (a, b) => a + b,
          0
        ) / Object.keys(course.config.folderMultipliers).length
      : course.config.defaultPracticeMultiplier;
  const totalHoursPerDay = adjustedHoursPerDay * (1 + avgMultiplier);
  const isAchievable = totalHoursPerDay <= 8;
  let recommendation: string;
  if (totalHoursPerDay <= 2) {
    recommendation = 'Easy pace! You can take it slow.';
  } else if (totalHoursPerDay <= 4) {
    recommendation = 'Moderate pace. Plan your study time well.';
  } else if (totalHoursPerDay <= 6) {
    recommendation = 'Challenging but doable. Stay focused!';
  } else if (isAchievable) {
    recommendation = 'Very intensive. Consider extending the deadline.';
  } else {
    recommendation =
      'Not achievable with current deadline. Consider extending it.';
  }
  return {
    deadline,
    daysRemaining,
    hoursRemaining,
    hoursPerDay: totalHoursPerDay,
    isAchievable,
    recommendation,
  };
}
export function suggestDeadline(
  course: Course,
  hoursPerDay: number = 2
): Date {
  const progress = calculateCourseProgress(course);
  const hoursRemaining = progress.remainingDuration / 3600;
  const daysNeeded = Math.ceil(hoursRemaining / hoursPerDay);
  return addDays(new Date(), daysNeeded);
}
