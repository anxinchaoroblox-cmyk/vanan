import { ProfileData, ThemePreset } from '../types';

export const DEFAULT_PROFILE: ProfileData = {
  name: "Văn An",
  title: "Creative Developer & Music Enthusiast",
  handle: "@vanan.bio",
  bio: "Xin chào! Tôi là Văn An. Chào mừng bạn đã ghé thăm không gian cá nhân của tôi. Đam mê lập trình, âm nhạc lo-fi thư giãn và không gian tương tác nghệ thuật. Kết nối với tôi qua các mạng xã hội bên dưới nhé!",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  backgroundUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80",
  backgroundBlur: 3,
  backgroundBrightness: 80,
  badges: ["Verified", "Văn An ✨", "Music Lover", "Night Owl"],
  location: "Vietnam 🇻🇳",
  statusText: "Đang lắng nghe giai điệu yêu thích 🎧",
  statusType: "online",
  skills: ["Creative UI", "Music Vibe", "Gaming", "Aesthetics"],
  socialLinks: [
    { id: '1', platform: 'Discord', username: 'vanan#0001', url: 'https://discord.com', color: '#5865F2' },
    { id: '2', platform: 'Facebook', username: 'Văn An', url: 'https://facebook.com', color: '#1877F2' },
    { id: '3', platform: 'TikTok', username: '@vanan.official', url: 'https://tiktok.com', color: '#00F2FE' },
    { id: '4', platform: 'Roblox', username: 'VanAn_Roblox', url: 'https://www.roblox.com', color: '#E0E0E0' },
    { id: '5', platform: 'Spotify', username: 'Văn An Playlist', url: 'https://spotify.com', color: '#1DB954' }
  ],
  viewsCount: 1337,
  // High quality royalty-free chill lo-fi track
  songUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
  songTitle: "Lofi Study Beats & Chill Vibe",
  songArtist: "FASSounds & Lofi Chill",
  songCover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80",
  defaultVolume: 0.75
};

export const PRESET_SONGS = [
  {
    title: "Lofi Study Beats & Chill Vibe",
    artist: "FASSounds & Lofi Chill",
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80"
  },
  {
    title: "Midnight City Ambient Chill",
    artist: "Lesfm Vibe",
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=watr-fluid-10149.mp3",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80"
  },
  {
    title: "Dreamy Aesthetic Nostalgia",
    artist: "Purrple Cat Style",
    url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80"
  }
];

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "night",
    name: "Midnight Obsidian",
    nameVi: "Đêm Huyền Bí (21h - 05h)",
    timePeriod: "night",
    bgGradient: "radial-gradient(ellipse at top, #111424 0%, #08090f 100%)",
    accentColor: "#38bdf8",
    cardBg: "rgba(15, 23, 42, 0.72)",
    borderColor: "rgba(56, 189, 248, 0.25)",
    textColor: "#f8fafc",
    glowColor: "rgba(56, 189, 248, 0.45)"
  },
  {
    id: "morning",
    name: "Morning Aurora",
    nameVi: "Bình Minh Tươi Sáng (06h - 11h)",
    timePeriod: "morning",
    bgGradient: "radial-gradient(ellipse at top, #1e293b 0%, #090d16 100%)",
    accentColor: "#34d399",
    cardBg: "rgba(15, 30, 30, 0.72)",
    borderColor: "rgba(52, 211, 153, 0.3)",
    textColor: "#f0fdf4",
    glowColor: "rgba(52, 211, 153, 0.4)"
  },
  {
    id: "afternoon",
    name: "Golden Afternoon",
    nameVi: "Chiều Nắng Vàng (12h - 17h)",
    timePeriod: "afternoon",
    bgGradient: "radial-gradient(ellipse at top, #292524 0%, #0c0a09 100%)",
    accentColor: "#fbbf24",
    cardBg: "rgba(28, 25, 23, 0.75)",
    borderColor: "rgba(251, 191, 36, 0.3)",
    textColor: "#fef3c7",
    glowColor: "rgba(251, 191, 36, 0.4)"
  },
  {
    id: "sunset",
    name: "Sunset Synthwave",
    nameVi: "Hoàng Hôn Lãng Mạn (18h - 20h)",
    timePeriod: "sunset",
    bgGradient: "radial-gradient(ellipse at top, #2e1065 0%, #090414 100%)",
    accentColor: "#f43f5e",
    cardBg: "rgba(30, 10, 45, 0.75)",
    borderColor: "rgba(244, 63, 94, 0.3)",
    textColor: "#fff1f2",
    glowColor: "rgba(244, 63, 94, 0.45)"
  },
  {
    id: "cyberpunk",
    name: "Cyber Neon",
    nameVi: "Cyberpunk Tím Neon",
    bgGradient: "radial-gradient(ellipse at top, #1f0836 0%, #06020c 100%)",
    accentColor: "#c084fc",
    cardBg: "rgba(20, 10, 35, 0.75)",
    borderColor: "rgba(192, 132, 252, 0.3)",
    textColor: "#faf5ff",
    glowColor: "rgba(192, 132, 252, 0.5)"
  },
  {
    id: "sakura",
    name: "Sakura Blossom",
    nameVi: "Hoa Anh Đào Nhật Bản",
    bgGradient: "radial-gradient(ellipse at top, #3b0724 0%, #0b0207 100%)",
    accentColor: "#f472b6",
    cardBg: "rgba(30, 12, 24, 0.75)",
    borderColor: "rgba(244, 114, 182, 0.3)",
    textColor: "#fdf2f8",
    glowColor: "rgba(244, 114, 182, 0.45)"
  }
];

export const PRESET_BACKGROUNDS = [
  {
    name: "Dải Ngân Hà Sao Băng",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80"
  },
  {
    name: "Biển Chiều & Hoàng Hôn",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80"
  },
  {
    name: "Thành Phố Đêm Lung Linh",
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1920&q=80"
  },
  {
    name: "Rừng Mưa Sương Mù Chill",
    url: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1920&q=80"
  }
];

export const PRESET_AVATARS = [
  {
    name: "Aesthetic Girl",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Cyber Chill Boy",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Anime Vibe Guy",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Retro Gamer Girl",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80"
  }
];
