import type { DirectoryAnalysis } from './directory-analyzer.js';
import { formatSecondsShort } from '../../utils/time-utils.js';
import chalk from 'chalk';
import { table } from 'table';
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
export function generateTextReport(analysis: DirectoryAnalysis): string {
  const lines: string[] = [];
  lines.push(chalk.bold('📊 Directory Analysis Report'));
  lines.push('═'.repeat(70));
  lines.push('');
  lines.push(chalk.bold('Overview'));
  lines.push('─'.repeat(70));
  lines.push(`Total Videos: ${chalk.cyan(analysis.totalVideos.toString())}`);
  lines.push(
    `Total Duration: ${chalk.cyan(formatSecondsShort(analysis.totalDuration))} (raw)`
  );
  lines.push(
    `Adjusted Duration: ${chalk.cyan(formatSecondsShort(analysis.adjustedDuration))} (at configured speed)`
  );
  lines.push(`Total Size: ${chalk.cyan(formatBytes(analysis.totalSize))}`);
  lines.push('');
  lines.push(chalk.bold('Progress'));
  lines.push('─'.repeat(70));
  lines.push(
    `Watched: ${chalk.green(analysis.watchedVideos.toString())} / ${chalk.cyan(analysis.totalVideos.toString())}`
  );
  lines.push(
    `Unwatched: ${chalk.yellow(analysis.unwatchedVideos.toString())}`
  );
  lines.push(
    `Completion: ${chalk.cyan(analysis.completionPercentage + '%')}`
  );
  lines.push('');
  if (analysis.sections.length > 0) {
    lines.push(chalk.bold('Sections'));
    lines.push('─'.repeat(70));
    const sectionTable = [
      ['Section', 'Videos', 'Duration', 'Watched', 'Progress'],
    ];
    for (const section of analysis.sections) {
      sectionTable.push([
        section.name,
        section.videoCount.toString(),
        formatSecondsShort(section.totalDuration),
        `${section.watchedCount}/${section.videoCount}`,
        `${section.completionPercentage}%`,
      ]);
    }
    lines.push(table(sectionTable));
    lines.push('');
  }
  if (Object.keys(analysis.formats).length > 0) {
    lines.push(chalk.bold('Video Formats'));
    lines.push('─'.repeat(70));
    const formatTable = [['Format', 'Count', 'Total Duration', 'Total Size']];
    for (const [format, data] of Object.entries(analysis.formats)) {
      formatTable.push([
        format,
        data.count.toString(),
        formatSecondsShort(data.totalDuration),
        formatBytes(data.totalSize),
      ]);
    }
    lines.push(table(formatTable));
    lines.push('');
  }
  lines.push(chalk.bold('Statistics'));
  lines.push('─'.repeat(70));
  lines.push(
    `Average Video Duration: ${chalk.cyan(formatSecondsShort(analysis.averageVideoDuration))}`
  );
  if (analysis.longestVideo) {
    lines.push(
      `Longest Video: ${chalk.cyan(analysis.longestVideo.filename)} (${formatSecondsShort(analysis.longestVideo.duration)})`
    );
  }
  if (analysis.shortestVideo) {
    lines.push(
      `Shortest Video: ${chalk.cyan(analysis.shortestVideo.filename)} (${formatSecondsShort(analysis.shortestVideo.duration)})`
    );
  }
  return lines.join('\n');
}
export function generateJSONReport(analysis: DirectoryAnalysis): string {
  return JSON.stringify(analysis, null, 2);
}
export function generateCSVReport(analysis: DirectoryAnalysis): string {
  const lines: string[] = [];
  lines.push('Metric,Value');
  lines.push(`Total Videos,${analysis.totalVideos}`);
  lines.push(`Total Duration (seconds),${analysis.totalDuration}`);
  lines.push(`Adjusted Duration (seconds),${analysis.adjustedDuration}`);
  lines.push(`Total Size (bytes),${analysis.totalSize}`);
  lines.push(`Watched Videos,${analysis.watchedVideos}`);
  lines.push(`Unwatched Videos,${analysis.unwatchedVideos}`);
  lines.push(`Completion Percentage,${analysis.completionPercentage}`);
  if (analysis.sections.length > 0) {
    lines.push('');
    lines.push('Section,Video Count,Total Duration (seconds),Watched Count,Completion Percentage');
    for (const section of analysis.sections) {
      lines.push(
        `"${section.name}",${section.videoCount},${section.totalDuration},${section.watchedCount},${section.completionPercentage}`
      );
    }
  }
  if (Object.keys(analysis.formats).length > 0) {
    lines.push('');
    lines.push('Format,Count,Total Duration (seconds),Total Size (bytes)');
    for (const [format, data] of Object.entries(analysis.formats)) {
      lines.push(`"${format}",${data.count},${data.totalDuration},${data.totalSize}`);
    }
  }
  return lines.join('\n');
}
