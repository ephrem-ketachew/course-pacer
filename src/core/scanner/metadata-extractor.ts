import { execFile } from 'child_process';
import { promisify } from 'util';
import { statSync } from 'fs';
import ffprobeStatic from 'ffprobe-static';
const execFileAsync = promisify(execFile);
interface FFprobeMetadata {
  format: {
    duration: string;
    size: string;
    format_name: string;
  };
}
export async function extractVideoMetadata(filePath: string): Promise<{
  duration: number;
  size: number;
  format: string;
}> {
  try {
    const ffprobePath = ffprobeStatic.path;
    const { stdout } = await execFileAsync(ffprobePath, [
      '-v',
      'error',
      '-show_entries',
      'format=duration,size,format_name',
      '-of',
      'json',
      filePath,
    ]);
    const metadata: FFprobeMetadata = JSON.parse(stdout);
    if (!metadata.format) {
      throw new Error('No format information found in video file');
    }
    const duration = parseFloat(metadata.format.duration ?? '0');
    const size = parseInt(metadata.format.size ?? '0', 10);
    const format = metadata.format.format_name?.split(',')[0] ?? 'unknown';
    if (isNaN(duration) || duration <= 0) {
      throw new Error('Invalid duration extracted from video');
    }
    return {
      duration: Math.round(duration),
      size,
      format,
    };
  } catch (error) {
    return fallbackMetadataExtraction(filePath, error);
  }
}
function fallbackMetadataExtraction(
  filePath: string,
  error: unknown
): {
  duration: number;
  size: number;
  format: string;
} {
  try {
    const stats = statSync(filePath);
    const size = stats.size;
    const estimatedDuration = Math.round((size / (1024 * 1024)) * 60);
    console.warn(`Warning: Could not extract metadata for ${filePath}. Using fallback estimation.`);
    if (error instanceof Error) {
      console.warn(`Error: ${error.message}`);
    }
    return {
      duration: Math.max(estimatedDuration, 60), 
      size,
      format: 'unknown',
    };
  } catch (fallbackError) {
    throw new Error(
      `Failed to extract metadata and fallback failed: ${
        fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
      }`
    );
  }
}
export function isFFprobeAvailable(): boolean {
  try {
    const ffprobePath = ffprobeStatic.path;
    return ffprobePath !== undefined && ffprobePath.length > 0;
  } catch {
    return false;
  }
}
