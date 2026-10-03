import { describe, it, expect } from 'vitest';
import {
  validatePlayerName,
  validateGameName,
  validateDescription,
  validateRoomId,
  validateAvatarFile,
} from '../validation';

describe('Shared Validation Utils', () => {
  describe('validatePlayerName', () => {
    it('rejects empty name or whitespace', () => {
      expect(validatePlayerName('').valid).toBe(false);
      expect(validatePlayerName('   ').valid).toBe(false);
    });

    it('rejects names shorter than minimum length', () => {
      expect(validatePlayerName('a').valid).toBe(false);
    });

    it('accepts valid name', () => {
      expect(validatePlayerName('Alex').valid).toBe(true);
      expect(validatePlayerName('Super Player 123').valid).toBe(true);
    });

    it('rejects names longer than 50 characters', () => {
      const longName = 'a'.repeat(51);
      expect(validatePlayerName(longName).valid).toBe(false);
    });
  });

  describe('validateGameName', () => {
    it('accepts empty game name initially', () => {
      expect(validateGameName('').valid).toBe(true);
    });

    it('accepts valid character names', () => {
      expect(validateGameName('Sherlock Holmes').valid).toBe(true);
    });

    it('rejects character names exceeding max length', () => {
      const longName = 'a'.repeat(51);
      expect(validateGameName(longName).valid).toBe(false);
    });
  });

  describe('validateDescription', () => {
    it('accepts valid description', () => {
      expect(validateDescription('A famous detective from 221B Baker St.').valid).toBe(true);
    });

    it('rejects descriptions exceeding 100 characters', () => {
      const longDesc = 'a'.repeat(101);
      expect(validateDescription(longDesc).valid).toBe(false);
    });
  });

  describe('validateRoomId', () => {
    it('rejects room ID shorter than 5 chars', () => {
      expect(validateRoomId('123').valid).toBe(false);
    });

    it('accepts valid room ID', () => {
      expect(validateRoomId('room-12345').valid).toBe(true);
    });
  });

  describe('validateAvatarFile', () => {
    it('rejects non-image types', () => {
      const res = validateAvatarFile({ size: 1024, type: 'application/pdf' });
      expect(res.valid).toBe(false);
    });

    it('rejects files larger than 2MB', () => {
      const res = validateAvatarFile({ size: 3 * 1024 * 1024, type: 'image/png' });
      expect(res.valid).toBe(false);
    });

    it('accepts valid image within size limit', () => {
      const res = validateAvatarFile({ size: 500 * 1024, type: 'image/png' });
      expect(res.valid).toBe(true);
    });
  });
});
