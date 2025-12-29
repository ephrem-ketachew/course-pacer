import { getCourseByPath, listCourses } from '../../storage/database.js';
import { analyzeCourse } from '../../core/analyzer/directory-analyzer.js';
import { generateTextReport, generateJSONReport, generateCSVReport } from '../../core/analyzer/report-generator.js';
import { writeFile } from 'fs/promises';
import chalk from 'chalk';
import { handleError, CourseNotFoundError } from '../../utils/error-handler.js';
export async function executeAnalyze(
  coursePath: string | undefined,
  options: {
    section?: string;
    watched?: boolean;
    unwatched?: boolean;
    format?: string;
    json?: boolean;
    csv?: boolean;
    output?: string;
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
    const filter: {
      section?: string;
      watched?: boolean;
      format?: string;
    } = {};
    if (options.section) {
      filter.section = options.section;
    }
    if (options.watched) {
      filter.watched = true;
    } else if (options.unwatched) {
      filter.watched = false;
    }
    if (options.format) {
      filter.format = options.format;
    }
    const analysis = analyzeCourse(course, filter);
    let report: string;
    if (options.csv) {
      report = generateCSVReport(analysis);
    } else if (options.json) {
      report = generateJSONReport(analysis);
    } else {
      report = generateTextReport(analysis);
    }
    if (options.output) {
      await writeFile(options.output, report, 'utf-8');
      console.log(chalk.green(`✓ Report saved to ${options.output}`));
    } else {
      console.log(report);
    }
  } catch (error) {
    handleError(error, 'analyze');
    process.exit(1);
  }
}
