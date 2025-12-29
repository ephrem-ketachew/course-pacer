import { describe, it, expect } from 'vitest';
import {
  validatePlaybackSpeed,
  validatePracticeMultiplier,
  validateVideoId,
} from '../../src/utils/validation.js';
import { ConfigurationError } from '../../src/utils/error-handler.js';

describe('Validation', () => {
  describe('validatePlaybackSpeed', () => {
    it('should validate correct speeds', () => {
      expect(() => validatePlaybackSpeed(1.0)).not.toThrow();
      expect(() => validatePlaybackSpeed(1.5)).not.toThrow();
      expect(() => validatePlaybackSpeed(2.0)).not.toThrow();
      expect(() => validatePlaybackSpeed(0.5)).not.toThrow();
      expect(() => validatePlaybackSpeed(3.0)).not.toThrow();
    });

    it('should throw for invalid speeds', () => {
      expect(() => validatePlaybackSpeed(0.4)).toThrow(ConfigurationError);
      expect(() => validatePlaybackSpeed(3.1)).toThrow(ConfigurationError);
      expect(() => validatePlaybackSpeed(NaN)).toThrow(ConfigurationError);
    });
  });

  describe('validatePracticeMultiplier', () => {
    it('should validate correct multipliers', () => {
      expect(() => validatePracticeMultiplier(0.0)).not.toThrow();
      expect(() => validatePracticeMultiplier(1.0)).not.toThrow();
      expect(() => validatePracticeMultiplier(5.0)).not.toThrow();
      expect(() => validatePracticeMultiplier(10.0)).not.toThrow();
    });

    it('should throw for invalid multipliers', () => {
      expect(() => validatePracticeMultiplier(-1)).toThrow(ConfigurationError);
      expect(() => validatePracticeMultiplier(10.1)).toThrow(ConfigurationError);
      expect(() => validatePracticeMultiplier(NaN)).toThrow(ConfigurationError);
    });
  });

  describe('validateVideoId', () => {
    it('should validate non-empty video IDs', () => {
      expect(() => validateVideoId('video-123')).not.toThrow();
      expect(() => validateVideoId('video.mp4')).not.toThrow();
    });

    it('should throw for empty video IDs', () => {
      expect(() => validateVideoId('')).toThrow();
      expect(() => validateVideoId('   ')).toThrow();
    });
  });
});

