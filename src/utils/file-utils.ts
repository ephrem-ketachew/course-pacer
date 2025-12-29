import { existsSync, statSync } from 'fs';
import { extname, basename, dirname, join } from 'path';
export const VIDEO_EXTENSIONS = [
  '.mp4',
  '.mkv',
  '.avi',
  '.mov',
  '.webm',
  '.flv',
  '.wmv',
  '.m4v',
] as const;
export function isVideoFile(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  return VIDEO_EXTENSIONS.includes(ext as typeof VIDEO_EXTENSIONS[number]);
}
export function getFileExtension(filePath: string): string {
  return extname(filePath).toLowerCase();
}
export function getFilenameWithoutExtension(filePath: string): string {
  return basename(filePath, extname(filePath));
}
export function isDirectory(path: string): boolean {
  if (!existsSync(path)) {
    return false;
  }
  return statSync(path).isDirectory();
}
export function isFile(path: string): boolean {
  if (!existsSync(path)) {
    return false;
  }
  return statSync(path).isFile();
}
export function getParentDirectory(filePath: string): string {
  return dirname(filePath);
}
export function joinPath(...segments: string[]): string {
  return join(...segments);
}
