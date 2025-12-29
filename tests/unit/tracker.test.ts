import { describe, it, expect } from 'vitest';
import {
  calculateCourseProgress,
  isVideoWatched,
  getNextUnwatchedVideo,
} from '../../src/core/tracker/progress-tracker.js';
import type { Course } from '../../src/models/course.js';

describe('Progress Tracker', () => {
  const mockCourse: Course = {
    id: 'test-course',
    rootPath: '/test/course',
    scannedAt: new Date(),
    videos: [
      {
        id: 'video-1',
        path: '/test/course/video1.mp4',
        relativePath: 'video1.mp4',
        filename: 'video1.mp4',
        duration: 3600, // 1 hour
        size: 1000000,
        format: 'mp4',
        lastModified: new Date(),
        order: 0,
      },
      {
        id: 'video-2',
        path: '/test/course/video2.mp4',
        relativePath: 'video2.mp4',
        filename: 'video2.mp4',
        duration: 1800, // 30 minutes
        size: 500000,
        format: 'mp4',
        lastModified: new Date(),
        section: 'Section 01',
        order: 1,
      },
      {
        id: 'video-3',
        path: '/test/course/video3.mp4',
        relativePath: 'video3.mp4',
        filename: 'video3.mp4',
        duration: 2700, // 45 minutes
        size: 750000,
        format: 'mp4',
        lastModified: new Date(),
        section: 'Section 01',
        order: 2,
      },
    ],
    progress: {
      'video-1': {
        videoId: 'video-1',
        watched: true,
        watchedAt: new Date(),
      },
      'video-2': {
        videoId: 'video-2',
        watched: false,
      },
    },
    config: {
      playbackSpeed: 1.0,
      defaultPracticeMultiplier: 1.0,
      folderMultipliers: {},
    },
  };

  describe('calculateCourseProgress', () => {
    it('should calculate correct completion percentage', () => {
      const progress = calculateCourseProgress(mockCourse);
      expect(progress.completionPercentage).toBe(33); // 1 out of 3 videos
      expect(progress.watchedVideos).toBe(1);
      expect(progress.totalVideos).toBe(3);
    });

    it('should calculate correct durations', () => {
      const progress = calculateCourseProgress(mockCourse);
      expect(progress.totalDuration).toBe(8100); // 3600 + 1800 + 2700
      expect(progress.watchedDuration).toBe(3600); // Only video-1 watched
      expect(progress.remainingDuration).toBe(4500); // 8100 - 3600
    });

    it('should calculate section-level progress', () => {
      const progress = calculateCourseProgress(mockCourse);
      expect(progress.sectionProgress['Section 01']).toBeDefined();
      expect(progress.sectionProgress['Section 01']?.totalVideos).toBe(2);
      expect(progress.sectionProgress['Section 01']?.watchedVideos).toBe(0);
    });

    it('should adjust durations for playback speed', () => {
      const progress = calculateCourseProgress(mockCourse, 2.0);
      // With 2x speed, durations should be halved
      expect(progress.totalDuration).toBe(4050); // 8100 / 2
    });
  });

  describe('isVideoWatched', () => {
    it('should return true for watched videos', () => {
      expect(isVideoWatched(mockCourse, 'video-1')).toBe(true);
    });

    it('should return false for unwatched videos', () => {
      expect(isVideoWatched(mockCourse, 'video-2')).toBe(false);
      expect(isVideoWatched(mockCourse, 'video-3')).toBe(false);
    });
  });

  describe('getNextUnwatchedVideo', () => {
    it('should return first unwatched video', () => {
      const next = getNextUnwatchedVideo(mockCourse);
      expect(next?.id).toBe('video-2');
    });

    it('should return null if all videos watched', () => {
      const allWatchedCourse: Course = {
        ...mockCourse,
        progress: {
          'video-1': { videoId: 'video-1', watched: true },
          'video-2': { videoId: 'video-2', watched: true },
          'video-3': { videoId: 'video-3', watched: true },
        },
      };
      const next = getNextUnwatchedVideo(allWatchedCourse);
      expect(next).toBeNull();
    });
  });
});

