import { GAME_LIMITS, ALLOWED_IMAGE_MIME_TYPES } from './constants';
import type { TGameState } from './types/game';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePlayerName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: 'Name cannot be empty' };
  }
  if (trimmed.length < GAME_LIMITS.MIN_NAME_LENGTH) {
    return {
      valid: false,
      error: `Name must be at least ${GAME_LIMITS.MIN_NAME_LENGTH} characters long`,
    };
  }
  if (trimmed.length > GAME_LIMITS.MAX_NAME_LENGTH) {
    return {
      valid: false,
      error: `Name cannot exceed ${GAME_LIMITS.MAX_NAME_LENGTH} characters`,
    };
  }
  return { valid: true };
}

export function validateGameName(gameName: string): ValidationResult {
  if (gameName.length > GAME_LIMITS.MAX_GAME_NAME_LENGTH) {
    return {
      valid: false,
      error: `Character name cannot exceed ${GAME_LIMITS.MAX_GAME_NAME_LENGTH} characters`,
    };
  }
  return { valid: true };
}

export function validateDescription(description: string): ValidationResult {
  if (description.length > GAME_LIMITS.MAX_DESCRIPTION_LENGTH) {
    return {
      valid: false,
      error: `Description cannot exceed ${GAME_LIMITS.MAX_DESCRIPTION_LENGTH} characters`,
    };
  }
  return { valid: true };
}

export function validateRoomId(roomId: string): ValidationResult {
  const trimmed = roomId.trim();
  if (trimmed.length < GAME_LIMITS.MIN_ROOM_ID_LENGTH) {
    return {
      valid: false,
      error: `Room ID must be at least ${GAME_LIMITS.MIN_ROOM_ID_LENGTH} characters`,
    };
  }
  return { valid: true };
}

export function validateAvatarFile(file: { size: number; type: string }): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  const isAllowedType = (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type);
  if (!isAllowedType && !file.type.startsWith('image/')) {
    return { valid: false, error: 'Only image files are allowed' };
  }
  if (file.size > GAME_LIMITS.MAX_AVATAR_SIZE_BYTES) {
    const sizeInMb = (GAME_LIMITS.MAX_AVATAR_SIZE_BYTES / (1024 * 1024)).toFixed(0);
    return { valid: false, error: `File size cannot exceed ${sizeInMb}MB` };
  }
  return { valid: true };
}

/**
 * Checks if `fromPlayerId` is allowed to edit/assign the character for `toPlayerId`
 * based on current game settings and active players.
 */
export function canAssignCharacter(
  fromPlayerId: string,
  toPlayerId: string,
  gameState: TGameState
): boolean {
  if (fromPlayerId === toPlayerId) return false;

  const fromPlayer = gameState.players.find((p) => p.id === fromPlayerId);
  const toPlayer = gameState.players.find((p) => p.id === toPlayerId);

  if (!fromPlayer || !toPlayer) return false;
  if (fromPlayer.isSpectator || toPlayer.isSpectator) return false;

  const mode = gameState.settings?.assignmentMode || 'free';
  const activePlayers = gameState.players.filter((p) => !p.isSpectator);

  if (mode === 'free') {
    return true;
  }

  if (mode === 'admin_only') {
    return Boolean(fromPlayer.isAdmin);
  }

  const fromIndex = activePlayers.findIndex((p) => p.id === fromPlayerId);
  const toIndex = activePlayers.findIndex((p) => p.id === toPlayerId);

  if (fromIndex === -1 || toIndex === -1) return false;

  if (mode === 'neighbor_right') {
    // Next player in circle (to the right)
    const expectedTargetIndex = (fromIndex + 1) % activePlayers.length;
    return toIndex === expectedTargetIndex;
  }

  if (mode === 'neighbor_left') {
    // Previous player in circle (to the left)
    const expectedTargetIndex = (fromIndex - 1 + activePlayers.length) % activePlayers.length;
    return toIndex === expectedTargetIndex;
  }

  return false;
}
