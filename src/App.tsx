import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, Volume2, Share2, Check, CheckCircle2 } from 'lucide-react';
import { ProfileData, ThemePreset, ThemeMode } from './types';
import { DEFAULT_PROFILE, THEME_PRESETS } from './data/defaultProfile';
import { WelcomeScreen } from './components/WelcomeScreen';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { MouseTrailCanvas } from './components/MouseTrailCanvas';
import { ProfileCard } from './components/ProfileCard';
import { ThemeControl } from './components/ThemeControl';
import { EditProfileModal } from './components/EditProfileModal';
import { ExportModal } from './components/ExportModal';
import { decodeProfileFromHash } from './utils/shareHelper';
import { loadProfileFromStorage, saveProfileToStorage } from './utils/storageHelper';

export default function App() {
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('realtime');
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentTimeString, setCurrentTimeString] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  // Initial synchronous profile state (from hash if available, or localStorage)
  const [profile, setProfile] = useState<ProfileData>(() => {
    try {
      const fromUrl = decodeProfileFromHash();
      if (fromUrl) {
        return { ...DEFAULT_PROFILE, ...fromUrl };
      }
      const saved = localStorage.getItem('user_bio_profile');
      if (saved) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Sync load warning:", e);
    }
    return DEFAULT_PROFILE;
  });

  // Asynchronous robust load from IndexedDB on startup
  // This guarantees that large base64 images and songs are properly restored even if localStorage quota was tight
  useEffect(() => {
    let isMounted = true;
    const fromUrl = decodeProfileFromHash();
    if (fromUrl) {
      setProfile(prev => ({ ...prev, ...fromUrl }));
      return;
    }

    loadProfileFromStorage().then((saved) => {
      if (isMounted && saved && saved.name) {
        setProfile((prev) => ({
          ...DEFAULT_PROFILE,
          ...saved,
          socialLinks: saved.socialLinks || prev.socialLinks
        }));
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Check URL hash change dynamically (e.g. user pastes new link or navs)
  useEffect(() => {
    const handleHashChange = () => {
      const shared = decodeProfileFromHash();
      if (shared) {
        setProfile((prev) => ({ ...prev, ...shared }));
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Calculate theme based on real-time hour of the day
  const getThemeByCurrentTime = useCallback((): ThemePreset => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      return THEME_PRESETS.find((t) => t.id === 'morning') || THEME_PRESETS[0];
    } else if (hour >= 12 && hour < 18) {
      return THEME_PRESETS.find((t) => t.id === 'afternoon') || THEME_PRESETS[0];
    } else if (hour >= 18 && hour < 21) {
      return THEME_PRESETS.find((t) => t.id === 'sunset') || THEME_PRESETS[0];
    } else {
      return THEME_PRESETS.find((t) => t.id === 'night') || THEME_PRESETS[0];
    }
  }, []);

  const [theme, setTheme] = useState<ThemePreset>(() => getThemeByCurrentTime());

  // Real-time clock & automatic theme update
  useEffect(() => {
    const updateTimeAndTheme = () => {
      const now = new Date();
      setCurrentTimeString(
        now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );

      if (themeMode === 'realtime') {
        const timeTheme = getThemeByCurrentTime();
        setTheme((current) => (current.id !== timeTheme.id ? timeTheme : current));
      }
    };

    updateTimeAndTheme();
    const interval = setInterval(updateTimeAndTheme, 1000);
    return () => clearInterval(interval);
  }, [themeMode, getThemeByCurrentTime]);

  // Global mouse position tracking for smooth parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handler when entering from Welcome screen
  const handleEnter = () => {
    setHasEntered(true);
    setAutoPlayAudio(true);
    // Increase view count & persist
    setProfile((prev) => {
      const updated = { ...prev, viewsCount: prev.viewsCount + 1 };
      saveProfileToStorage(updated);
      return updated;
    });
  };

  // Save profile updates reliably to storage (IndexedDB + localStorage)
  const handleSaveProfile = async (updated: ProfileData) => {
    setProfile(updated);
    const success = await saveProfileToStorage(updated);
    if (success) {
      setToastMessage('✓ Đã lưu hồ sơ thành công! Thoát ra vào lại vẫn còn nguyên vẹn.');
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  // Parallax floating frame offsets
  const frameOffsetX = (mousePos.x / (typeof window !== 'undefined' ? window.innerWidth : 1) - 0.5) * 24;
  const frameOffsetY = (mousePos.y / (typeof window !== 'undefined' ? window.innerHeight : 1) - 0.5) * 24;

  return (
    <main
      id="bio-app-container"
      className="relative min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 overflow-x-hidden overflow-y-auto"
      style={{
        background: theme.bgGradient,
        color: theme.textColor,
      }}
    >
      {/* Dynamic Background with Real-time theme & Parallax */}
      <BackgroundCanvas
        theme={theme}
        backgroundUrl={profile.backgroundUrl}
        mousePos={mousePos}
        backgroundBlur={profile.backgroundBlur}
        backgroundBrightness={profile.backgroundBrightness}
      />

      {/* Interactive Mouse Trail & Particle Canvas */}
      <MouseTrailCanvas accentColor={theme.accentColor} enabled={true} />

      {/* Floating Save Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 z-50 px-4 py-2.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Entry Screen (Click to enter & auto play music) */}
      <AnimatePresence>
        {!hasEntered && (
          <WelcomeScreen
            onEnter={handleEnter}
            theme={theme}
            avatarUrl={profile.avatarUrl}
            name={profile.name}
          />
        )}
      </AnimatePresence>

      {/* Main Interactive Interface (Reveals once clicked) */}
      {hasEntered && (
        <>
          {/* Top Bar Real-Time Theme & Mode Controller */}
          <ThemeControl
            currentTheme={theme}
            themeMode={themeMode}
            onSelectTheme={setTheme}
            onToggleThemeMode={setThemeMode}
            currentTimeString={currentTimeString}
          />

          {/* Floating Aesthetic Decorative Frames that follow cursor smoothly */}
          <div
            className="fixed top-20 left-8 md:left-24 pointer-events-none hidden sm:block opacity-35 transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(${frameOffsetX * 1.6}px, ${frameOffsetY * 1.6}px, 0) rotate(6deg)`,
            }}
          >
            <div className="w-24 h-24 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md p-2 flex flex-col justify-between">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <div className="text-[10px] font-mono text-white/60">Bio Link Vibe</div>
            </div>
          </div>

          <div
            className="fixed bottom-16 right-8 md:right-24 pointer-events-none hidden sm:block opacity-30 transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(${-frameOffsetX * 1.4}px, ${-frameOffsetY * 1.4}px, 0) rotate(-8deg)`,
            }}
          >
            <div className="w-28 h-20 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md p-3 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="text-[10px] font-mono text-white/70 leading-tight">
                Real-time Audio
              </div>
            </div>
          </div>

          {/* Central Rectangular Profile Card (Khung hình chữ nhật ở giữa) */}
          <div className="relative z-20 w-full max-w-lg my-auto py-6">
            <ProfileCard
              profile={profile}
              theme={theme}
              autoPlayAudio={autoPlayAudio}
              onOpenEditModal={() => setIsEditModalOpen(true)}
              onExport={() => setIsExportModalOpen(true)}
            />
          </div>

          {/* Subtle Bottom Action Bar & Watermark */}
          <footer className="relative z-20 mt-auto py-2 text-center text-[11px] font-mono text-white/40 flex items-center justify-center gap-3">
            <span>{profile.name} • Bio Link & Music</span>
            <span>•</span>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-cyan-400/80 hover:text-cyan-300 underline underline-offset-2 transition-colors"
            >
              Chỉnh sửa hồ sơ
            </button>
            <span>•</span>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="text-cyan-300 hover:text-cyan-200 font-semibold flex items-center gap-1 transition-colors"
            >
              <Share2 className="w-3 h-3" />
              <span>Xuất hồ sơ</span>
            </button>
          </footer>
        </>
      )}

      {/* Edit Profile & Media Upload Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
        onExport={(updated) => {
          handleSaveProfile(updated);
          setIsExportModalOpen(true);
        }}
      />

      {/* Export & Publish Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        profile={profile}
      />
    </main>
  );
}
