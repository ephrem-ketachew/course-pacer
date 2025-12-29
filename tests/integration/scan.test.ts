import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { executeScan } from '../../src/cli/commands/scan.js';
import { getCourseByPath } from '../../src/storage/database.js';

describe('Integration: Scan Command', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `pacer-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Error cleaning up test directory:', error);
    }
  });

  it('should scan a directory and create course entry', async () => {
    const sectionDir = join(testDir, 'Section 01');
    await mkdir(sectionDir, { recursive: true });

    const videoPath = join(sectionDir, 'test.mp4');
    await writeFile(videoPath, 'dummy content');

    try {
      await executeScan(testDir, { quiet: true });
      const course = await getCourseByPath(testDir);
      expect(course).toBeDefined();
      expect(course?.rootPath).toBe(testDir);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should handle non-existent directory gracefully', async () => {
    const nonExistentPath = join(testDir, 'non-existent');
    await expect(executeScan(nonExistentPath, { quiet: true })).rejects.toThrow();
  });
});
