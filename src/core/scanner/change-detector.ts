import { stat } from 'fs/promises';
import type { Stats } from 'fs';
import type { VideoFile } from '../../models/video.js';
export interface ChangeDetectionResult {
  added: VideoFile[];
  removed: string[]; 
  modified: VideoFile[];
  unchanged: VideoFile[];
}
export async function detectChanges(
  existingVideos: VideoFile[],
  newVideos: VideoFile[]
): Promise<ChangeDetectionResult> {
  const existingMap = new Map<string, VideoFile>();
  const newMap = new Map<string, VideoFile>();
  for (const video of existingVideos) {
    existingMap.set(video.id, video);
  }
  for (const video of newVideos) {
    newMap.set(video.id, video);
  }
  const added: VideoFile[] = [];
  const removed: string[] = [];
  const modified: VideoFile[] = [];
  const unchanged: VideoFile[] = [];
  for (const [id, video] of newMap) {
    if (!existingMap.has(id)) {
      added.push(video);
    }
  }
  for (const [id] of existingMap) {
    if (!newMap.has(id)) {
      removed.push(id);
    }
  }
  for (const [id, newVideo] of newMap) {
    const existingVideo = existingMap.get(id);
    if (existingVideo) {
      const isModified =
        newVideo.size !== existingVideo.size ||
        newVideo.lastModified.getTime() !== existingVideo.lastModified.getTime() ||
        newVideo.duration !== existingVideo.duration;
      if (isModified) {
        try {
          const stats: Stats = await stat(newVideo.path);
          modified.push({
            ...newVideo,
            lastModified: stats.mtime,
          });
        } catch {
          removed.push(id);
        }
      } else {
        unchanged.push(newVideo);
      }
    }
  }
  return {
    added,
    removed,
    modified,
    unchanged,
  };
}
export async function isVideoModified(video: VideoFile): Promise<boolean> {
  try {
    const stats: Stats = await stat(video.path);
    return stats.mtime.getTime() !== video.lastModified.getTime() || stats.size !== video.size;
  } catch {
    return true;
  }
}
