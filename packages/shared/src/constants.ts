export const GAME_LIMITS = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MAX_GAME_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 100,
  MIN_ROOM_ID_LENGTH: 5,
  MAX_AVATAR_SIZE_BYTES: 2 * 1024 * 1024, // 2MB
} as const;

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];
