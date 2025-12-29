import { describe, it, expect } from 'vitest';
import {
  parseTimeToSeconds,
  formatSeconds,
  formatSecondsShort,
  adjustDurationForSpeed,
} from '../src/utils/time-utils.js';
import { isVideoFile } from '../src/utils/file-utils.js';

describe('Time Utilities', () => {
  describe('parseTimeToSeconds', () => {
    it('should parse hours correctly', () => {
      expect(parseTimeToSeconds('3h')).toBe(10800);
      expect(parseTimeToSeconds('2.5h')).toBe(9000);
      expect(parseTimeToSeconds('0.5h')).toBe(1800);
    });

    it('should parse minutes correctly', () => {
      expect(parseTimeToSeconds('180m')).toBe(10800);
      expect(parseTimeToSeconds('30m')).toBe(1800);
      expect(parseTimeToSeconds('90m')).toBe(5400);
    });

    it('should handle whitespace', () => {
      expect(parseTimeToSeconds(' 3h ')).toBe(10800);
      expect(parseTimeToSeconds('180 m')).toBe(10800);
    });

    it('should throw error for invalid format', () => {
      expect(() => parseTimeToSeconds('invalid')).toThrow();
      expect(() => parseTimeToSeconds('3')).toThrow();
      expect(() => parseTimeToSeconds('3s')).toThrow();
    });
  });

  describe('formatSeconds', () => {
    it('should format seconds correctly', () => {
      expect(formatSeconds(3661)).toBe('1:01:01');
      expect(formatSeconds(3665)).toBe('1:01:05');
      expect(formatSeconds(1800)).toBe('30:00');
      expect(formatSeconds(45)).toBe('0:45');
    });
  });

  describe('formatSecondsShort', () => {
    it('should format seconds to short string', () => {
      expect(formatSecondsShort(10800)).toBe('3h');
      expect(formatSecondsShort(5400)).toBe('1h 30m');
      expect(formatSecondsShort(1800)).toBe('30m');
      expect(formatSecondsShort(45)).toBe('45s');
    });
  });

  describe('adjustDurationForSpeed', () => {
    it('should adjust duration for playback speed', () => {
      expect(adjustDurationForSpeed(3600, 1.5)).toBe(2400);
      expect(adjustDurationForSpeed(3600, 2.0)).toBe(1800);
      expect(adjustDurationForSpeed(3600, 1.0)).toBe(3600);
    });

    it('should throw error for invalid speed', () => {
      expect(() => adjustDurationForSpeed(3600, 0)).toThrow();
      expect(() => adjustDurationForSpeed(3600, -1)).toThrow();
    });
  });
});

describe('File Utilities', () => {
  describe('isVideoFile', () => {
    it('should identify video files correctly', () => {
      expect(isVideoFile('video.mp4')).toBe(true);
      expect(isVideoFile('video.mkv')).toBe(true);
      expect(isVideoFile('video.avi')).toBe(true);
      expect(isVideoFile('video.mov')).toBe(true);
      expect(isVideoFile('video.webm')).toBe(true);
    });

    it('should reject non-video files', () => {
      expect(isVideoFile('document.pdf')).toBe(false);
      expect(isVideoFile('image.jpg')).toBe(false);
      expect(isVideoFile('script.js')).toBe(false);
      expect(isVideoFile('video.txt')).toBe(false);
    });

    it('should handle case insensitivity', () => {
      expect(isVideoFile('video.MP4')).toBe(true);
      expect(isVideoFile('video.MKV')).toBe(true);
    });
  });
});

