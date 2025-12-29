#!/usr/bin/env node

import { Command } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { executeScan } from '../src/cli/commands/scan.js';
import { executeStatus } from '../src/cli/commands/status.js';
import { executeMark } from '../src/cli/commands/mark.js';
import { executePlan } from '../src/cli/commands/plan.js';
import { executeConfig } from '../src/cli/commands/config.js';
import { executeAnalyze } from '../src/cli/commands/analyze.js';
import { executeLaunch } from '../src/cli/commands/launch.js';
import { executeTimer } from '../src/cli/commands/timer.js';
import { executeExport } from '../src/cli/commands/export.js';
import { executeDeadline } from '../src/cli/commands/deadline.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJsonPath = join(__dirname, '..', '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

const program = new Command();

program
  .name('pacer')
  .description('An intelligent CLI tool for managing and pacing video-based courseware')
  .version(packageJson.version);

program
  .command('scan')
  .description('Scan a directory for video files and update the database')
  .argument('<path>', 'Directory path to scan')
  .option('-f, --force', 'Force re-scan even if course already exists')
  .option('-q, --quiet', 'Suppress output (except errors)')
  .action(async (path: string, options: { force?: boolean; quiet?: boolean }) => {
    await executeScan(path, options);
  });

program
  .command('status')
  .description('Show current progress and statistics')
  .argument('[path]', 'Course path (optional, shows all courses if omitted)')
  .option('-d, --detailed', 'Show detailed section-level progress')
  .option('--json', 'Output as JSON')
  .action(async (path: string | undefined, options: { detailed?: boolean; json?: boolean }) => {
    await executeStatus(path, options);
  });

program
  .command('plan')
  .description('Generate a study session plan')
  .argument('<time>', 'Time budget (e.g., 3h, 180m)')
  .argument('[course-path]', 'Course path (optional, uses first course if omitted)')
  .option('--from <checkpoint>', 'Start from checkpoint (last, beginning, checkpoint, or video-id)', 'last')
  .option('--section <section>', 'Limit to specific section')
  .option('--no-practice', 'Exclude practice time from budget')
  .option('--json', 'Output as JSON')
  .action(async (time: string, coursePath: string | undefined, options: { from?: string; section?: string; noPractice?: boolean; json?: boolean }) => {
    await executePlan(time, coursePath, options);
  });

program
  .command('mark')
  .description('Mark a video as watched or unwatched')
  .argument('<video-id>', 'Video ID, filename, or course path')
  .option('-w, --watched', 'Mark as watched')
  .option('-u, --unwatched', 'Mark as unwatched')
  .option('-a, --all', 'Mark all videos in course')
  .option('-s, --section <section>', 'Mark all videos in section')
  .option('-n, --notes <notes>', 'Add notes to video')
  .action(async (videoId: string, options: { watched?: boolean; unwatched?: boolean; all?: boolean; section?: string; notes?: string }) => {
    const status = options.watched ? 'watched' : options.unwatched ? 'unwatched' : undefined;
    await executeMark(videoId, { status, all: options.all, section: options.section, notes: options.notes });
  });

program
  .command('config')
  .description('Interactive configuration menu')
  .argument('[course-path]', 'Course path (optional, configures first course if omitted)')
  .option('--speed <speed>', 'Set playback speed (e.g., 1.5)')
  .option('--multiplier <folder:value>', 'Set practice multiplier for folder (format: folder:value)')
  .option('--reset', 'Reset to defaults')
  .action(async (coursePath: string | undefined, options: { speed?: string; multiplier?: string; reset?: boolean }) => {
    await executeConfig(coursePath, options);
  });

program
  .command('analyze')
  .description('Analyze a course directory and display statistics')
  .argument('[course-path]', 'Course path (optional, uses first course if omitted)')
  .option('--section <section>', 'Filter by section')
  .option('--watched', 'Show only watched videos')
  .option('--unwatched', 'Show only unwatched videos')
  .option('--format <format>', 'Filter by video format')
  .option('--json', 'Output as JSON')
  .option('--csv', 'Output as CSV')
  .option('-o, --output <file>', 'Save report to file')
  .action(async (coursePath: string | undefined, options: { section?: string; watched?: boolean; unwatched?: boolean; format?: string; json?: boolean; csv?: boolean; output?: string }) => {
    await executeAnalyze(coursePath, options);
  });

program
  .command('launch')
  .description('Launch a video in default media player')
  .argument('<video-id>', 'Video ID or filename')
  .argument('[course-path]', 'Course path (optional)')
  .action(async (videoId: string, coursePath: string | undefined) => {
    await executeLaunch(videoId, coursePath);
  });

program
  .command('timer')
  .description('Start Pomodoro timer for study sessions')
  .option('--work <minutes>', 'Work duration in minutes', '25')
  .option('--break <minutes>', 'Break duration in minutes', '5')
  .option('--start', 'Start timer immediately')
  .action(async (options: { work?: string; break?: string; start?: boolean }) => {
    const work = options.work ? parseInt(options.work, 10) : undefined;
    const breakDuration = options.break ? parseInt(options.break, 10) : undefined;
    await executeTimer({ work, break: breakDuration, start: options.start });
  });

program
  .command('export')
  .description('Export study plans')
  .argument('<type>', 'Export type (calendar)')
  .argument('[course-path]', 'Course path (optional)')
  .option('--time <time>', 'Time budget for plan (e.g., 3h)')
  .option('--date <date>', 'Start date (YYYY-MM-DD)')
  .option('-o, --output <file>', 'Output file path')
  .action(async (type: string, coursePath: string | undefined, options: { time?: string; date?: string; output?: string }) => {
    await executeExport(type as 'calendar', coursePath, options);
  });

program
  .command('deadline')
  .description('Calculate study requirements for deadline')
  .argument('[course-path]', 'Course path (optional)')
  .option('--deadline <date>', 'Target deadline (YYYY-MM-DD)')
  .option('--suggest', 'Suggest optimal deadline')
  .option('--hours-per-day <hours>', 'Hours per day for suggestion', '2')
  .action(async (coursePath: string | undefined, options: { deadline?: string; suggest?: boolean; hoursPerDay?: string }) => {
    const hoursPerDay = options.hoursPerDay ? parseFloat(options.hoursPerDay) : undefined;
    await executeDeadline(coursePath, { deadline: options.deadline, suggest: options.suggest, hoursPerDay });
  });

program.parse();

