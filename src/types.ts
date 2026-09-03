export interface SocialLink {
  id: string;
  platform: string;
  username: string;
  url: string;
  color?: string;
}

export interface ProfileData {
  name: string;
  title: string;
  handle: string;
  bio: string;
  avatarUrl: string;
  backgroundUrl: string;
  backgroundBlur?: number;
  backgroundBrightness?: number;
  badges: string[];
  location: string;
  statusText: string;
  statusType: 'online' | 'idle' | 'dnd' | 'listening';
  socialLinks: SocialLink[];
  skills: string[];
  viewsCount: number;
  songUrl: string;
  songTitle: string;
  songArtist: string;
  songCover: string;
  defaultVolume: number;
}

export interface ThemePreset {
  id: string;
  name: string;
  nameVi: string;
  timePeriod?: 'morning' | 'afternoon' | 'sunset' | 'night';
  bgGradient: string;
  accentColor: string;
  cardBg: string;
  borderColor: string;
  textColor: string;
  glowColor: string;
}

export type ThemeMode = 'realtime' | 'manual';
