import { getDatabase } from '../../storage/database.js';
import { format, isToday, differenceInDays, parseISO } from 'date-fns';
export async function updateStreak(): Promise<{
  current: number;
  longest: number;
  isNewRecord: boolean;
}> {
  const db = await getDatabase();
  if (!db.data.analytics) {
    db.data.analytics = {};
  }
  if (!db.data.analytics.streaks) {
    db.data.analytics.streaks = {
      current: 0,
      longest: 0,
      lastStudyDate: undefined,
    };
  }
  const streaks = db.data.analytics.streaks;
  const today = format(new Date(), 'yyyy-MM-dd');
  const lastStudyDate = streaks.lastStudyDate
    ? parseISO(streaks.lastStudyDate)
    : null;
  let current = streaks.current;
  let longest = streaks.longest;
  let isNewRecord = false;
  if (lastStudyDate) {
    if (isToday(lastStudyDate)) {
      return { current, longest, isNewRecord };
    }
    const daysDiff = differenceInDays(new Date(), lastStudyDate);
    if (daysDiff === 1) {
      current = streaks.current + 1;
    } else {
      current = 1;
    }
  } else {
    current = 1;
  }
  if (current > longest) {
    longest = current;
    isNewRecord = true;
  }
  db.data.analytics.streaks = {
    current,
    longest,
    lastStudyDate: today,
  };
  await db.write();
  return { current, longest, isNewRecord };
}
export async function getStreak(): Promise<{
  current: number;
  longest: number;
  lastStudyDate: string | undefined;
}> {
  const db = await getDatabase();
  if (!db.data.analytics?.streaks) {
    return {
      current: 0,
      longest: 0,
      lastStudyDate: undefined as string | undefined,
    };
  }
  const streaks = db.data.analytics.streaks;
  return {
    current: streaks.current,
    longest: streaks.longest,
    lastStudyDate: streaks.lastStudyDate,
  };
}
export async function isStreakAtRisk(): Promise<boolean> {
  const streak = await getStreak();
  if (!streak.lastStudyDate || streak.current === 0) {
    return false;
  }
  const lastStudyDate = parseISO(streak.lastStudyDate);
  const daysDiff = differenceInDays(new Date(), lastStudyDate);
  return daysDiff === 1;
}
