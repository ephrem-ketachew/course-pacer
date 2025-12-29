import type { Course } from '../../models/course.js';
import { calculateCourseProgress } from '../tracker/progress-tracker.js';
import { getStreak } from './streak-tracker.js';
export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlockedAt?: Date;
}
export async function checkAchievements(course: Course): Promise<Achievement[]> {
  const achievements: Achievement[] = [];
  const progress = calculateCourseProgress(course);
  const streak = await getStreak();
  if (progress.completionPercentage >= 100) {
    achievements.push({
      id: 'course_complete',
      name: 'Course Master',
      description: 'Completed an entire course',
      emoji: '🎓',
      unlocked: true,
    });
  } else if (progress.completionPercentage >= 50) {
    achievements.push({
      id: 'halfway_there',
      name: 'Halfway Hero',
      description: 'Completed 50% of a course',
      emoji: '🏆',
      unlocked: true,
    });
  }
  if (streak.current >= 7) {
    achievements.push({
      id: 'week_streak',
      name: 'Week Warrior',
      description: 'Studied 7 days in a row',
      emoji: '🔥',
      unlocked: true,
    });
  }
  if (streak.current >= 30) {
    achievements.push({
      id: 'month_streak',
      name: 'Monthly Master',
      description: 'Studied 30 days in a row',
      emoji: '💪',
      unlocked: true,
    });
  }
  if (streak.longest >= 100) {
    achievements.push({
      id: 'century_streak',
      name: 'Century Champion',
      description: 'Achieved a 100-day streak',
      emoji: '👑',
      unlocked: true,
    });
  }
  if (progress.watchedVideos >= 100) {
    achievements.push({
      id: 'hundred_videos',
      name: 'Century Watcher',
      description: 'Watched 100 videos',
      emoji: '📺',
      unlocked: true,
    });
  }
  return achievements;
}
export function getMotivationalMessage(
  progress: { completionPercentage: number },
  streak: { current: number }
): string {
  const messages: string[] = [];
  if (streak.current > 0) {
    if (streak.current >= 7) {
      messages.push(`🔥 Amazing! ${streak.current}-day streak! Keep it up!`);
    } else if (streak.current >= 3) {
      messages.push(`💪 Great streak! ${streak.current} days in a row!`);
    } else {
      messages.push(`✨ You're on a ${streak.current}-day streak!`);
    }
  }
  if (progress.completionPercentage >= 100) {
    messages.push('🎉 Congratulations! Course completed!');
  } else if (progress.completionPercentage >= 75) {
    messages.push('🚀 Almost there! You\'re 75% done!');
  } else if (progress.completionPercentage >= 50) {
    messages.push('📈 Halfway there! Keep going!');
  } else if (progress.completionPercentage >= 25) {
    messages.push('🌟 Great start! You\'re making progress!');
  } else {
    messages.push('💡 Every journey begins with a single step!');
  }
  return messages.join(' ');
}
