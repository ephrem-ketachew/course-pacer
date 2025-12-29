import { getCourseByPath, listCourses } from '../../storage/database.js';
import {
  calculateDeadlineRequirements,
  suggestDeadline,
} from '../../core/workflow/deadline-calculator.js';
import chalk from 'chalk';
import { format } from 'date-fns';
import { handleError, CourseNotFoundError } from '../../utils/error-handler.js';
export async function executeDeadline(
  coursePath: string | undefined,
  options: {
    deadline?: string;
    suggest?: boolean;
    hoursPerDay?: number;
  }
): Promise<void> {
  try {
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
    if (options.suggest) {
      const hoursPerDay = options.hoursPerDay ?? 2;
      const suggestedDeadline = suggestDeadline(course, hoursPerDay);
      displaySuggestedDeadline(suggestedDeadline, hoursPerDay);
    } else if (options.deadline) {
      const deadline = new Date(options.deadline);
      if (isNaN(deadline.getTime())) {
        throw new Error(`Invalid date format: ${options.deadline}`);
      }
      const calculation = calculateDeadlineRequirements(course, deadline);
      displayDeadlineCalculation(calculation);
    } else {
      throw new Error('Either --deadline or --suggest must be provided');
    }
  } catch (error) {
    handleError(error, 'deadline');
    process.exit(1);
  }
}
function displaySuggestedDeadline(deadline: Date, hoursPerDay: number): void {
  console.log('\n' + chalk.bold('📅 Suggested Deadline'));
  console.log('═'.repeat(60));
  console.log(
    `Based on ${chalk.cyan(hoursPerDay + ' hours/day')} study time:`
  );
  console.log(
    `Suggested deadline: ${chalk.green(format(deadline, 'MMMM dd, yyyy'))}`
  );
  console.log(
    chalk.gray(`  (${format(deadline, 'EEEE, MMMM dd, yyyy')})`)
  );
}
function displayDeadlineCalculation(calc: {
  deadline: Date;
  daysRemaining: number;
  hoursRemaining: number;
  hoursPerDay: number;
  isAchievable: boolean;
  recommendation: string;
}): void {
  console.log('\n' + chalk.bold('⏰ Deadline Analysis'));
  console.log('═'.repeat(60));
  console.log(`Deadline: ${chalk.cyan(format(calc.deadline, 'MMMM dd, yyyy'))}`);
  console.log(`Days remaining: ${chalk.yellow(calc.daysRemaining.toString())}`);
  console.log(
    `Hours remaining: ${chalk.yellow(calc.hoursRemaining.toFixed(1))} hours`
  );
  const requiredColor = calc.isAchievable ? chalk.green : chalk.red;
  console.log(
    `Required: ${requiredColor(calc.hoursPerDay.toFixed(1) + ' hours/day')}`
  );
  console.log(`\n${chalk.bold('Recommendation:')} ${calc.recommendation}`);
  if (!calc.isAchievable) {
    console.log(
      chalk.yellow('\n⚠️  Consider extending your deadline or increasing daily study time.')
    );
  }
}
function isNaN(value: number): boolean {
  return Number.isNaN(value);
}
