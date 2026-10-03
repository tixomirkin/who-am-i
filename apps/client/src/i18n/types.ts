export type Language = 'ru' | 'en';

export interface Translations {
  // General & Navbar
  appName: string;
  tagline: string;
  welcome: string;
  home: string;
  copyLink: string;
  linkCopied: string;
  copyFailed: string;
  syncState: string;
  connecting: string;
  madeWithLove: string;
  circleCounter: string;
  currentTurn: string;
  yourTurn: string;
  adminBadge: string;
  spectators: string;
  spectatorsNone: string;
  you: string;

  // Landing
  roomCodeOrUrl: string;
  roomCodePlaceholder: string;
  enterRoom: string;
  or: string;
  createRoom: string;
  roomCreated: string;
  nicknameOptional: string;
  nicknamePlaceholder: string;
  invalidRoomId: string;

  // Game Board
  noPlayersYet: string;
  noPlayersDesc: string;
  joinGame: string;
  switchToSpectator: string;
  mysteryCardHidden: string;
  finishTurn: string;
  targetCharacter: string;
  characterPlaceholder: string;
  onlyPlayersCanEdit: string;
  lockedEditing: string;
  assignedByAdmin: string;
  assignedByAuthor: string;

  // Profile Modal
  editProfile: string;
  editProfileDesc: string;
  yourNameInGame: string;
  namePlaceholder: string;
  changeAvatar: string;
  uploadAvatar: string;
  avatarFormatHint: string;
  orChoosePreset: string;
  connectionId: string;
  resetSessionId: string;
  sessionReset: string;
  profileUpdated: string;
  enterValidName: string;
  onlyImagesAllowed: string;
  save: string;
  processing: string;

  // Settings Modal
  roomSettings: string;
  roomSettingsAdminDesc: string;
  roomSettingsUserDesc: string;
  characterAssignmentMode: string;
  activeModeBadge: string;
  transferAdmin: string;
  adminTransferred: string;
  close: string;
  saveSettings: string;
  settingsUpdated: string;
  onlyAdminCanChangeSettings: string;

  // Modes
  modeFreeTitle: string;
  modeFreeDesc: string;
  modeRightTitle: string;
  modeRightDesc: string;
  modeLeftTitle: string;
  modeLeftDesc: string;
  modeAdminTitle: string;
  modeAdminDesc: string;

  // Presets
  presetDetective: string;
  presetWizard: string;
  presetRobot: string;
  presetAlien: string;
  presetNinja: string;
  presetCat: string;
  presetBear: string;
  presetSuperhero: string;
}
