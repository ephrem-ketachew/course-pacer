import { writeFile } from 'fs/promises';
import { format, addMinutes } from 'date-fns';
import type { SessionPlan } from '../../models/session.js';
export function generateICS(
  plan: SessionPlan,
  startDate: Date = new Date(),
  courseName: string = 'Study Session'
): string {
  const lines: string[] = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//Course Pacer//Study Plan//EN');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');
  const endDate = addMinutes(startDate, Math.ceil(plan.totalTime / 60));
  const formatICSDate = (date: Date): string => {
    return format(date, "yyyyMMdd'T'HHmmss");
  };
  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${Date.now()}@course-pacer`);
  lines.push(`DTSTART:${formatICSDate(startDate)}`);
  lines.push(`DTEND:${formatICSDate(endDate)}`);
  lines.push(`SUMMARY:${courseName} - Study Session`);
  const description = [
    `Study Plan: ${plan.videos.length} videos`,
    `Total Time: ${Math.ceil(plan.totalTime / 60)} minutes`,
    `Video Time: ${Math.ceil(plan.totalVideoTime / 60)} minutes`,
    `Practice Time: ${Math.ceil(plan.totalPracticeTime / 60)} minutes`,
    '',
    'Videos:',
    ...plan.videos.map((v, i) => `${i + 1}. ${v.filename}`),
  ].join('\\n');
  lines.push(`DESCRIPTION:${description.replace(/\n/g, '\\n')}`);
  lines.push('STATUS:CONFIRMED');
  lines.push('SEQUENCE:0');
  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
export async function exportToICS(
  plan: SessionPlan,
  outputPath: string,
  startDate?: Date,
  courseName?: string
): Promise<void> {
  const icsContent = generateICS(plan, startDate, courseName);
  await writeFile(outputPath, icsContent, 'utf-8');
}
