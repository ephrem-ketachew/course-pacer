import { describe, it, expect } from 'vitest';
import { isVideoFile } from '../../src/utils/file-utils.js';
import { isFFprobeAvailable } from '../../src/core/scanner/metadata-extractor.js';

describe('Scanner Utilities', () => {
  describe('isVideoFile', () => {
    it('should identify video files correctly', () => {
      expect(isVideoFile('video.mp4')).toBe(true);
      expect(isVideoFile('video.mkv')).toBe(true);
      expect(isVideoFile('video.avi')).toBe(true);
    });

    it('should reject non-video files', () => {
      expect(isVideoFile('document.pdf')).toBe(false);
      expect(isVideoFile('image.jpg')).toBe(false);
    });
  });

  describe('FFprobe availability', () => {
    it('should detect FFprobe availability', () => {
      const available = isFFprobeAvailable();
      expect(typeof available).toBe('boolean');
    });
  });
});

