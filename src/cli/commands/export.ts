import { getCourseByPath, listCourses } from '../../storage/database.js';
import { generateSessionPlan } from '../../core/planner/session-planner.js';
import { exportToICS } from '../../core/workflow/calendar-export.js';
import { parseTimeToSeconds } from '../../utils/time-utils.js';
import chalk from 'chalk';
import { handleError, CourseNotFoundError } from '../../utils/error-handler.js';
import { validateTimeString } from '../../utils/error-handler.js';
export async function executeExport(
  type: 'calendar',
  coursePath: string | undefined,
  options: {
    time?: string;
    output?: string;
    date?: string;
  }
): Promise<void> {
  try {
    if (type === 'calendar') {
      await exportCalendar(coursePath, options);
    } else {
      throw new Error(`Unknown export type: ${type}`);
    }
  } catch (error) {
    handleError(error, 'export');
    process.exit(1);
  }
}
async function exportCalendar(
  coursePath: string | undefined,
  options: {
    time?: string;
    output?: string;
    date?: string;
  }
): Promise<void> {
  let course;
  if (coursePath) {
    course = await getCourseByPath(coursePath);
    if (!course) {
      throw new CourseNotFoundError(coursePath);
    }
  } else {
    const courses = await listCourses();
    if (courses.length === 0) {
      throw new Error('No courses found. Run "pacer scan <path>" to add a course.');
    }
    if (courses.length > 1) {
      throw new Error('Multiple courses found. Please specify a course path.');
    }
    course = courses[0];
    if (!course) {
      throw new Error('No course found');
    }
  }
  let plan;
  if (options.time) {
    validateTimeString(options.time);
    const timeBudget = parseTimeToSeconds(options.time);
    plan = generateSessionPlan(course, {
      timeBudget,
      startFrom: 'last',
      includePractice: true,
    });
  } else {
    const progress = await import('../../core/tracker/progress-tracker.js').then(
      (m) => m.calculateCourseProgress(course)
    );
    const timeBudget = progress.remainingDuration;
    plan = generateSessionPlan(course, {
      timeBudget,
      startFrom: 'last',
      includePractice: true,
    });
  }
  const startDate = options.date
    ? new Date(options.date)
    : new Date();
  const outputPath =
    options.output ?? `study-plan-${format(new Date(), 'yyyy-MM-dd')}.ics`;
  await exportToICS(plan, outputPath, startDate, course.rootPath);
  console.log(chalk.green(`✓ Calendar exported to: ${outputPath}`));
  console.log(
    chalk.gray(`  Import this file into your calendar app (Google Calendar, Outlook, etc.)`)
  );
}
import { format } from 'date-fns';
