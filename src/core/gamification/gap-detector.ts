import type { Course } from '../../models/course.js';
import type { VideoFile } from '../../models/video.js';
export interface GapDetectionResult {
  gaps: Array<{
    section: string | undefined;
    expected: string;
    found: string[];
    missing: string[];
  }>;
  hasGaps: boolean;
}
function extractSequenceNumber(filename: string): number | null {
  const match = filename.match(/^(\d+)/);
  if (match) {
    return parseInt(match[1] ?? '0', 10);
  }
  return null;
}
export function detectGaps(course: Course): GapDetectionResult {
  const gaps: GapDetectionResult['gaps'] = [];
  const sectionMap = new Map<string | undefined, VideoFile[]>();
  for (const video of course.videos) {
    const section = video.section ?? 'Uncategorized';
    if (!sectionMap.has(section)) {
      sectionMap.set(section, []);
    }
    sectionMap.get(section)!.push(video);
  }
  for (const [section, videos] of sectionMap.entries()) {
    const sortedVideos = [...videos].sort((a, b) => a.order - b.order);
    const sequences = sortedVideos
      .map((v) => ({
        video: v,
        seq: extractSequenceNumber(v.filename),
      }))
      .filter((item) => item.seq !== null);
    if (sequences.length < 2) {
      continue; 
    }
    const sequenceNumbers = sequences.map((s) => s.seq!);
    const minSeq = Math.min(...sequenceNumbers);
    const maxSeq = Math.max(...sequenceNumbers);
    const missing: number[] = [];
    const found: number[] = [];
    for (let i = minSeq; i <= maxSeq; i++) {
      if (sequenceNumbers.includes(i)) {
        found.push(i);
      } else {
        missing.push(i);
      }
    }
    if (missing.length > 0) {
      gaps.push({
        section: section === 'Uncategorized' ? undefined : section,
        expected: `Sequences ${minSeq}-${maxSeq}`,
        found: found.map((n) => n.toString()).sort(),
        missing: missing.map((n) => n.toString()).sort(),
      });
    }
  }
  return {
    gaps,
    hasGaps: gaps.length > 0,
  };
}
export function formatGapWarning(gaps: GapDetectionResult): string {
  if (!gaps.hasGaps) {
    return '';
  }
  const warnings: string[] = ['⚠️  Gap Detection Warning:'];
  for (const gap of gaps.gaps) {
    const sectionInfo = gap.section ? ` in "${gap.section}"` : '';
    warnings.push(
      `  • Missing sequences: ${gap.missing.join(', ')}${sectionInfo}`
    );
    warnings.push(`    Expected: ${gap.expected}`);
    warnings.push(`    Found: ${gap.found.join(', ')}`);
  }
  warnings.push(
    '\n  Tip: Check if files were renamed or moved. Consider re-scanning.'
  );
  return warnings.join('\n');
}
