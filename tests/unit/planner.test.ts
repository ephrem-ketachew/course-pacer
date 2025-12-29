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
    duration: 3600,
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
      expect(result.adjustedVideoTime).toBe(2400);
    });

    it('should calculate practice time with default multiplier', () => {
      const result = calculateVideoTime(mockVideo, mockConfig);
      expect(result.practiceTime).toBe(2400);
      expect(result.totalTime).toBe(4800);
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
      expect(result.practiceTime).toBe(7200);
      expect(result.totalTime).toBe(9600);
    });
  });

  describe('calculateTotalTime', () => {
    it('should calculate totals for multiple videos', () => {
      const videos = [
        mockVideo,
        { ...mockVideo, id: 'video-2', duration: 1800 },
      ];

      const result = calculateTotalTime(videos, mockConfig);
      expect(result.totalVideoTime).toBe(3600);
      expect(result.totalPracticeTime).toBe(3600);
      expect(result.totalTime).toBe(7200);
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
        duration: 3600,
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
        duration: 1800,
        size: 500000,
        format: 'mp4',
        lastModified: new Date(),
        order: 1,
      },
    ],
    progress: {},
    config: {
      playbackSpeed: 1.0,
      defaultPracticeMultiplier: 0.5,
      folderMultipliers: {},
    },
    checkpoint: 'video-1',
  };

  describe('generateSessionPlan', () => {
    it('should generate plan within time budget', () => {
      const plan = generateSessionPlan(mockCourse, {
        timeBudget: 7200,
        startFrom: 'beginning',
        includePractice: true,
      });

      expect(plan.videos.length).toBe(1);
      expect(plan.videos[0]?.id).toBe('video-1');
      expect(plan.totalTime).toBeLessThanOrEqual(7200);
    });

    it('should exclude practice time when requested', () => {
      const plan = generateSessionPlan(mockCourse, {
        timeBudget: 7200,
        startFrom: 'beginning',
        includePractice: false,
      });

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

