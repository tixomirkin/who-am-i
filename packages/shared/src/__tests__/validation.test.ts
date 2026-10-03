import { describe, it, expect } from 'vitest';
import {
  validatePlayerName,
  validateGameName,
  validateDescription,
  validateRoomId,
  validateAvatarFile,
  canAssignCharacter,
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

  describe('canAssignCharacter game modes', () => {
    const createTestState = (mode: any) => ({
      players: [
        { id: 'p1', name: 'P1', gameName: '', description: '', isAdmin: true, isSpectator: false, avatar: null },
        { id: 'p2', name: 'P2', gameName: '', description: '', isAdmin: false, isSpectator: false, avatar: null },
        { id: 'p3', name: 'P3', gameName: '', description: '', isAdmin: false, isSpectator: false, avatar: null },
        { id: 'spec', name: 'Spec', gameName: '', description: '', isAdmin: false, isSpectator: true, avatar: null },
      ],
      round: 0,
      turnPlayerId: 'p1',
      settings: { assignmentMode: mode, allowSpectatorViewing: true },
    });

    it('free mode: any active player can assign to any other active player', () => {
      const state = createTestState('free');
      expect(canAssignCharacter('p1', 'p2', state)).toBe(true);
      expect(canAssignCharacter('p2', 'p1', state)).toBe(true);
      expect(canAssignCharacter('p1', 'p1', state)).toBe(false); // cannot assign self
      expect(canAssignCharacter('spec', 'p1', state)).toBe(false); // spectator cannot assign
    });

    it('admin_only mode: only admin can assign to active players', () => {
      const state = createTestState('admin_only');
      expect(canAssignCharacter('p1', 'p2', state)).toBe(true);
      expect(canAssignCharacter('p2', 'p3', state)).toBe(false);
    });

    it('neighbor_right mode: players assign to the player to their right (next in circle)', () => {
      const state = createTestState('neighbor_right');
      expect(canAssignCharacter('p1', 'p2', state)).toBe(true);
      expect(canAssignCharacter('p2', 'p3', state)).toBe(true);
      expect(canAssignCharacter('p3', 'p1', state)).toBe(true);
      expect(canAssignCharacter('p1', 'p3', state)).toBe(false);
    });

    it('neighbor_left mode: players assign to the player to their left (previous in circle)', () => {
      const state = createTestState('neighbor_left');
      expect(canAssignCharacter('p1', 'p3', state)).toBe(true);
      expect(canAssignCharacter('p3', 'p2', state)).toBe(true);
      expect(canAssignCharacter('p2', 'p1', state)).toBe(true);
      expect(canAssignCharacter('p1', 'p2', state)).toBe(false);
    });
  });
});
