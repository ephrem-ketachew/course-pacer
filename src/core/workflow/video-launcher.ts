import { exec } from 'child_process';
import { promisify } from 'util';
import { platform } from 'os';
import type { VideoFile } from '../../models/video.js';
const execAsync = promisify(exec);
export async function launchVideo(video: VideoFile): Promise<void> {
  const osPlatform = platform();
  let command: string;
  switch (osPlatform) {
    case 'win32':
      command = `start "" "${video.path}"`;
      break;
    case 'darwin':
      command = `open "${video.path}"`;
      break;
    case 'linux':
      command = `xdg-open "${video.path}"`;
      break;
    default:
      throw new Error(`Unsupported platform: ${osPlatform}`);
  }
  try {
    await execAsync(command);
  } catch (error) {
    throw new Error(
      `Failed to launch video: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
