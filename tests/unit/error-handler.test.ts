import { describe, it, expect } from 'vitest';
import {
  CourseNotFoundError,
  VideoNotFoundError,
  InvalidTimeFormatError,
  InvalidPathError,
  validateTimeString,
  validatePath,
} from '../../src/utils/error-handler.js';

describe('Error Handler', () => {
  describe('Custom Error Classes', () => {
    it('should create CourseNotFoundError', () => {
      const error = new CourseNotFoundError('/test/path');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('CourseNotFoundError');
      expect(error.message).toContain('/test/path');
    });

    it('should create VideoNotFoundError', () => {
      const error = new VideoNotFoundError('video-123');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('VideoNotFoundError');
      expect(error.message).toContain('video-123');
    });

    it('should create InvalidTimeFormatError', () => {
      const error = new InvalidTimeFormatError('invalid');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('InvalidTimeFormatError');
      expect(error.message).toContain('invalid');
    });

    it('should create InvalidPathError', () => {
      const error = new InvalidPathError('/invalid');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('InvalidPathError');
      expect(error.message).toContain('/invalid');
    });
  });

  describe('validateTimeString', () => {
    it('should validate correct time formats', () => {
      expect(() => validateTimeString('3h')).not.toThrow();
      expect(() => validateTimeString('180m')).not.toThrow();
      expect(() => validateTimeString('2.5h')).not.toThrow();
      expect(() => validateTimeString(' 3h ')).not.toThrow();
    });

    it('should throw for invalid formats', () => {
      expect(() => validateTimeString('invalid')).toThrow(InvalidTimeFormatError);
      expect(() => validateTimeString('3')).toThrow(InvalidTimeFormatError);
      expect(() => validateTimeString('3s')).toThrow(InvalidTimeFormatError);
    });
  });

  describe('validatePath', () => {
    it('should validate non-empty paths', () => {
      expect(validatePath('/test/path')).toBe('/test/path');
      expect(validatePath('  /test/path  ')).toBe('/test/path');
    });

    it('should throw for empty paths', () => {
      expect(() => validatePath('')).toThrow(InvalidPathError);
      expect(() => validatePath('   ')).toThrow(InvalidPathError);
    });

    it('should throw for paths with null bytes', () => {
      expect(() => validatePath('/test\0path')).toThrow(InvalidPathError);
    });
  });
});

