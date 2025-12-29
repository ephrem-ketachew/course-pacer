import { getCourseByPath, listCourses } from '../../storage/database.js';
import { generateSessionPlan } from '../../core/planner/session-planner.js';
import { parseTimeToSeconds, formatSecondsShort } from '../../utils/time-utils.js';
import chalk from 'chalk';
import { table } from 'table';
import { handleError } from '../../utils/error-handler.js';
import { validateTimeString } from '../../utils/error-handler.js';
export async function executePlan(
  timeString: string,
  coursePath: string | undefined,
  options: {
    from?: string;
    section?: string;
    noPractice?: boolean;
    json?: boolean;
  }
): Promise<void> {
  try {
    validateTimeString(timeString);
    const timeBudget = parseTimeToSeconds(timeString);
    let course;
    if (coursePath) {
      course = await getCourseByPath(coursePath);
      if (!course) {
        console.error(chalk.red(`Course not found: ${coursePath}`));
        process.exit(1);
      }
    } else {
      const courses = await listCourses();
      if (courses.length === 0) {
        console.error(
          chalk.red('No courses found. Run "pacer scan <path>" to add a course.')
        );
        process.exit(1);
      }
      if (courses.length > 1) {
        console.error(
          chalk.yellow(
            'Multiple courses found. Please specify a course path.'
          )
        );
        process.exit(1);
      }
      course = courses[0];
    }
    if (!course) {
      console.error(chalk.red('No course found'));
      process.exit(1);
    }
    const startFrom = options.from ?? 'last';
    const plan = generateSessionPlan(course, {
      timeBudget,
      startFrom,
      section: options.section,
      includePractice: !options.noPractice,
    });
    if (options.json) {
      console.log(JSON.stringify(plan, null, 2));
      return;
    }
    displayPlan(plan, timeBudget, options.noPractice ?? false);
  } catch (error) {
    handleError(error, 'plan');
    process.exit(1);
  }
}
function displayPlan(
  plan: {
    videos: Array<{ id: string; filename: string; section?: string; duration: number }>;
    totalVideoTime: number;
    totalPracticeTime: number;
    totalTime: number;
  },
  timeBudget: number,
  noPractice: boolean
): void {
  console.log('\n' + chalk.bold('📅 Study Session Plan'));
  console.log('═'.repeat(70));
  console.log('\n' + chalk.bold('Time Breakdown'));
  console.log('─'.repeat(70));
  console.log(
    `Budget: ${chalk.cyan(formatSecondsShort(timeBudget))}`
  );
  console.log(
    `Video Time: ${chalk.cyan(formatSecondsShort(plan.totalVideoTime))}`
  );
  if (!noPractice) {
    console.log(
      `Practice Time: ${chalk.yellow(formatSecondsShort(plan.totalPracticeTime))}`
    );
  }
  console.log(
    `Total: ${chalk.green(formatSecondsShort(plan.totalTime))} / ${chalk.cyan(formatSecondsShort(timeBudget))}`
  );
  const utilization = Math.round((plan.totalTime / timeBudget) * 100);
  const utilizationColor = utilization >= 90 ? chalk.green : utilization >= 70 ? chalk.yellow : chalk.gray;
  console.log(`Utilization: ${utilizationColor(utilization + '%')}`);
  if (plan.videos.length === 0) {
    console.log('\n' + chalk.yellow('No videos fit in the time budget'));
    return;
  }
  console.log('\n' + chalk.bold(`Playlist (${plan.videos.length} videos)`));
  console.log('─'.repeat(70));
  const tableData = [
    ['#', 'Video', 'Section', 'Duration', 'Status'],
  ];
  plan.videos.forEach((video, index) => {
    tableData.push([
      (index + 1).toString(),
      video.filename.length > 40 ? '...' + video.filename.slice(-37) : video.filename,
      video.section ?? '-',
      formatSecondsShort(video.duration),
      chalk.gray('Pending'),
    ]);
  });
  console.log(table(tableData));
  console.log('\n' + chalk.bold('Next Steps'));
  console.log('─'.repeat(70));
  console.log(
    chalk.gray('Start watching from: ') + chalk.cyan(plan.videos[0]?.filename ?? 'N/A')
  );
  if (plan.videos.length > 0) {
    console.log(
      chalk.gray('After completing, mark as watched: ') +
        chalk.cyan(`pacer mark "${plan.videos[plan.videos.length - 1]?.filename}" --watched`)
    );
  }
}
