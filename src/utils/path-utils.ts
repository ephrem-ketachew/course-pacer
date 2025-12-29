import { resolve, normalize, isAbsolute, relative } from 'path';
export function resolvePath(path: string): string {
  return normalize(resolve(path));
}
export function isAbsolutePath(path: string): boolean {
  return isAbsolute(path);
}
export function getRelativePath(from: string, to: string): string {
  return relative(from, to);
}
