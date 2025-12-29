import { describe, it, expect } from 'vitest';
import {
  calculateVideoTime,
  calculateTotalTime,
} from '../../src/core/planner/time-calculator.js';
import { generateSessionPlan } from '../../src/core/planner/session-planner.js';
import type { Course } from '../../src/models/course.js';

describe('Time Calculator', () => {
  const mockVideo = {
    id: 'video-1',
    path: '/test/video1.mp4',
    relativePath: 'video1.mp4',
    filename: 'video1.mp4',
    duration: 3600, // 1 hour
    size: 1000000,
    format: 'mp4',
    lastModified: new Date(),
    order: 0,
  };

  const mockConfig = {
    playbackSpeed: 1.5,
    defaultPracticeMultiplier: 1.0,
    folderMultipliers: {},
  };

  describe('calculateVideoTime', () => {
    it('should adjust duration for playback speed', () => {
      const result = calculateVideoTime(mockVideo, mockConfig);
      expect(result.adjustedVideoTime).toBe(2400); // 3600 / 1.5
    });

    it('should calculate practice time with default multiplier', () => {
      const result = calculateVideoTime(mockVideo, mockConfig);
      expect(result.practiceTime).toBe(2400); // 2400 * 1.0
      expect(result.totalTime).toBe(4800); // 2400 + 2400
    });

    it('should use section-specific multiplier', () => {
      const videoWithSection = {
        ...mockVideo,
        section: 'Hard Section',
      };
      const configWithMultiplier = {
        ...mockConfig,
        folderMultipliers: { 'Hard Section': 3.0 },
      };

      const result = calculateVideoTime(videoWithSection, configWithMultiplier);
      expect(result.practiceTime).toBe(7200); // 2400 * 3.0
      expect(result.totalTime).toBe(9600); // 2400 + 7200
    });
  });

  describe('calculateTotalTime', () => {
    it('should calculate totals for multiple videos', () => {
      const videos = [
        mockVideo,
        { ...mockVideo, id: 'video-2', duration: 1800 },
      ];

      const result = calculateTotalTime(videos, mockConfig);
      expect(result.totalVideoTime).toBe(3600); // (3600 + 1800) / 1.5
      expect(result.totalPracticeTime).toBe(3600); // 3600 * 1.0
      expect(result.totalTime).toBe(7200); // 3600 + 3600
    });
  });
});

describe('Session Planner', () => {
  const mockCourse: Course = {
    id: 'test-course',
    rootPath: '/test/course',
    scannedAt: new Date(),
    videos: [
      {
        id: 'video-1',
        path: '/test/video1.mp4',
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
        path: '/test/video2.mp4',
        relativePath: 'video2.mp4',
        filename: 'video2.mp4',
        duration: 1800, // 30 minutes
        size: 500000,
        format: 'mp4',
        lastModified: new Date(),
        order: 1,
      },
    ],
    progress: {},
    config: {
      playbackSpeed: 1.0,
      defaultPracticeMultiplier: 0.5, // 30 min practice per hour
      folderMultipliers: {},
    },
    checkpoint: 'video-1',
  };

  describe('generateSessionPlan', () => {
    it('should generate plan within time budget', () => {
      // Budget: 2 hours = 7200 seconds
      // Video 1: 3600s video + 1800s practice = 5400s
      // Video 2: 1800s video + 900s practice = 2700s
      // Total for both: 8100s (exceeds budget)
      // Should only include video 1: 5400s

      const plan = generateSessionPlan(mockCourse, {
        timeBudget: 7200, // 2 hours
        startFrom: 'beginning',
        includePractice: true,
      });

      expect(plan.videos.length).toBe(1);
      expect(plan.videos[0]?.id).toBe('video-1');
      expect(plan.totalTime).toBeLessThanOrEqual(7200);
    });

    it('should exclude practice time when requested', () => {
      const plan = generateSessionPlan(mockCourse, {
        timeBudget: 7200, // 2 hours
        startFrom: 'beginning',
        includePractice: false,
      });

      // Without practice, both videos should fit (3600 + 1800 = 5400s)
      expect(plan.videos.length).toBe(2);
      expect(plan.totalPracticeTime).toBe(0);
    });

    it('should start from checkpoint', () => {
      const plan = generateSessionPlan(mockCourse, {
        timeBudget: 10000,
        startFrom: 'checkpoint',
        includePractice: true,
      });

      expect(plan.startCheckpoint).toBe('video-1');
    });
  });
});

