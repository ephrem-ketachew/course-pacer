import { readdir, stat } from 'fs/promises';
import { join, dirname, relative } from 'path';
import { isVideoFile } from '../../utils/file-utils.js';
import { resolvePath } from '../../utils/path-utils.js';
import { extractVideoMetadata } from './metadata-extractor.js';
import { createHash } from 'crypto';
import type { VideoFile } from '../../models/video.js';
export interface ScanOptions {
  rootPath: string;
  onProgress?: (current: number, total: number, file: string) => void;
  onError?: (error: Error, file: string) => void;
}
export interface ScanResult {
  videos: VideoFile[];
  totalDuration: number;
  totalSize: number;
  sections: string[];
  errors: Array<{ file: string; error: string }>;
}
function naturalSort(a: string, b: string): number {
  const aParts = a.match(/(\d+|\D+)/g) ?? [];
  const bParts = b.match(/(\d+|\D+)/g) ?? [];
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] ?? '';
    const bPart = bParts[i] ?? '';
    const aNum = parseInt(aPart, 10);
    const bNum = parseInt(bPart, 10);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      if (aNum !== bNum) {
        return aNum - bNum;
      }
    } else {
      if (aPart !== bPart) {
        return aPart.localeCompare(bPart);
      }
    }
  }
  return 0;
}
function generateVideoId(filePath: string, rootPath: string): string {
  const relativePath = relative(rootPath, filePath);
  return createHash('sha256').update(relativePath).digest('hex').substring(0, 16);
}
async function scanDirectory(
  dirPath: string,
  rootPath: string,
  options: ScanOptions,
  orderCounter: { value: number }
): Promise<VideoFile[]> {
  const videos: VideoFile[] = [];
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    entries.sort((a, b) => naturalSort(a.name, b.name));
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      try {
        if (entry.isDirectory()) {
          const subVideos = await scanDirectory(
            fullPath,
            rootPath,
            options,
            orderCounter
          );
          videos.push(...subVideos);
        } else if (entry.isFile() && isVideoFile(entry.name)) {
          try {
            const stats = await stat(fullPath);
            const relativePath = relative(rootPath, fullPath);
            const section = dirname(relativePath) !== '.' ? dirname(relativePath) : undefined;
            const metadata = await extractVideoMetadata(fullPath);
            const video: VideoFile = {
              id: generateVideoId(fullPath, rootPath),
              path: fullPath,
              relativePath,
              filename: entry.name,
              duration: metadata.duration,
              size: metadata.size,
              format: metadata.format,
              lastModified: stats.mtime,
              section,
              order: orderCounter.value++,
            };
            videos.push(video);
            if (options.onProgress) {
              options.onProgress(videos.length, videos.length, entry.name);
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            if (options.onError) {
              options.onError(
                new Error(`Failed to process ${entry.name}: ${errorMessage}`),
                fullPath
              );
            }
          }
        }
      } catch (error) {
        if (options.onError) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          options.onError(
            new Error(`Failed to access ${entry.name}: ${errorMessage}`),
            fullPath
          );
        }
      }
    }
  } catch (error) {
    if (options.onError) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      options.onError(
        new Error(`Failed to read directory ${dirPath}: ${errorMessage}`),
        dirPath
      );
    }
  }
  return videos;
}
export async function scanForVideos(
  options: ScanOptions
): Promise<ScanResult> {
  const rootPath = resolvePath(options.rootPath);
  const errors: Array<{ file: string; error: string }> = [];
  const errorHandler = (error: Error, file: string) => {
    errors.push({ file, error: error.message });
    if (options.onError) {
      options.onError(error, file);
    }
  };
  const scanOptions: ScanOptions = {
    ...options,
    rootPath,
    onError: errorHandler,
  };
  const orderCounter = { value: 0 };
  const videos = await scanDirectory(rootPath, rootPath, scanOptions, orderCounter);
  const totalDuration = videos.reduce((sum, video) => sum + video.duration, 0);
  const totalSize = videos.reduce((sum, video) => sum + video.size, 0);
  const sections = Array.from(
    new Set(videos.map((v) => v.section).filter((s): s is string => s !== undefined))
  ).sort(naturalSort);
  return {
    videos,
    totalDuration,
    totalSize,
    sections,
    errors,
  };
}
