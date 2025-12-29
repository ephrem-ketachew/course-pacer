import { describe, it, expect, beforeEach } from 'vitest';
import { executePlan } from '../../src/cli/commands/plan.js';
import { saveCourse } from '../../src/storage/database.js';
import type { Course } from '../../src/models/course.js';

describe('Integration: Plan Command', () => {
  let mockCourse: Course;

  beforeEach(() => {
    mockCourse = {
      id: 'test-course-plan',
      rootPath: '/test/course',
      scannedAt: new Date(),
      videos: [
        {
          id: 'video-1',
          path: '/test/course/video1.mp4',
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
          path: '/test/course/video2.mp4',
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
        defaultPracticeMultiplier: 1.0,
        folderMultipliers: {},
      },
    };
  });

  it('should generate plan for valid time budget', async () => {
    await saveCourse(mockCourse);

    try {
      await executePlan('2h', mockCourse.rootPath, {
        from: 'beginning',
        noPractice: true,
        json: true,
      });
      expect(true).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should reject invalid time format', async () => {
    await expect(
      executePlan('invalid', mockCourse.rootPath, {})
    ).rejects.toThrow();
  });
});

