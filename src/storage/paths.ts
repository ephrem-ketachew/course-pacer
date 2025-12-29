import { homedir } from 'os';
import { join } from 'path';
export function appDataDir(): string {
  const home = homedir();
  if (process.platform === 'win32') {
    return join(process.env.APPDATA || home, 'course-pacer');
  }
  return join(home, '.config', 'course-pacer');
}
export function databasePath(): string {
  return join(appDataDir(), 'database.json');
}
