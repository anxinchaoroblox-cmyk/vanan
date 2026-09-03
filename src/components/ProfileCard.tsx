import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  Eye,
  Sparkles,
  MapPin,
  ExternalLink,
  Edit3,
  Share2,
  Headphones,
  Check,
  Send
} from 'lucide-react';
import { ProfileData, ThemePreset } from '../types';
import { MusicPlayer } from './MusicPlayer';
import { BrandIcon } from './BrandIcon';

interface ProfileCardProps {
  profile: ProfileData;
  theme: ThemePreset;
  autoPlayAudio: boolean;
  onOpenEditModal: () => void;
  onExport: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  theme,
  autoPlayAudio,
  onOpenEditModal,
  onExport
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [localTime, setLocalTime] = useState<string>('');

  // Live real-time clock indicator
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLocalTime(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 3D Parallax Tilt Physics with Smooth Springs
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 120, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const copyProfileLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="w-full max-w-md mx-auto p-4 perspective-1000 select-none"
      style={{ perspective: '1200px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        ref={cardRef}
        id="main-profile-card"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          borderColor: theme.borderColor,
          boxShadow: `0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px -10px ${theme.glowColor}`,
        }}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl overflow-hidden glass-card transition-colors duration-500"
      >
        {/* Dynamic Glass Reflection Glare that tracks cursor */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-20 transition-opacity duration-300 z-30"
          style={{
            background: `radial-gradient(circle 350px at ${glareX} ${glareY}, rgba(255,255,255,0.4) 0%, transparent 75%)`,
          }}
        />

        {/* Top Decorative Banner / Background Header inside card */}
        <div className="relative h-28 w-full overflow-hidden bg-black/40">
          <img
            src={profile.backgroundUrl}
            alt="Banner"
            className="w-full h-full object-cover opacity-60 filter blur-[1px] transform scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-[#0c0e17]" />

          {/* Quick Action Buttons (Edit Profile & Export/Share) */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
            <button
              id="btn-edit-profile-trigger"
              onClick={onOpenEditModal}
              title="Tùy chỉnh thông tin, ảnh & nhạc"
              className="p-2 rounded-xl bg-black/50 hover:bg-white/20 border border-white/15 text-white/80 hover:text-white transition-all backdrop-blur-md"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              id="btn-export-profile-trigger"
              onClick={onExport}
              title="Xuất bản & Chia sẻ hồ sơ"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Xuất</span>
            </button>
          </div>

          {/* Real-time Time & Online Status Tag */}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/50 border border-white/15 backdrop-blur-md text-[11px] font-mono text-white/80">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{localTime || 'Đang cập nhật'}</span>
            </div>
          </div>
        </div>

        {/* Card Body with Avatar at the top (1 cái avatar nhỏ ở trên 1 cái khung hình chữ nhật) */}
        <div className="px-6 pb-6 pt-0 relative z-20 flex flex-col items-center text-center">
          
          {/* Avatar Container with 3D Pop (translateZ) */}
          <div
            className="relative -mt-12 mb-3.5 group cursor-pointer"
            style={{ transform: 'translateZ(25px)' }}
            onClick={onOpenEditModal}
            title="Nhấn để đổi ảnh đại diện"
          >
            {/* Pulsing ring around avatar */}
            <div
              className="absolute -inset-1 rounded-full opacity-70 filter blur-sm transition-all group-hover:opacity-100"
              style={{ background: theme.accentColor }}
            />
            
            {/* Avatar image */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/40 shadow-xl bg-black/80 p-0.5">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Online Status Dot */}
            <span
              className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0c0e17] shadow-md"
              title="Đang trực tuyến"
            />
          </div>

          {/* Name & Title */}
          <div style={{ transform: 'translateZ(20px)' }} className="mb-2">
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
                {profile.name}
              </h2>
              <span title="Tài khoản đã xác thực">
                <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />
              </span>
            </div>
            <p className="text-xs font-mono text-cyan-300/80 mb-1">
              {profile.handle}
            </p>
            <p className="text-xs text-white/70 max-w-xs leading-normal">
              {profile.title}
            </p>
          </div>

          {/* Status Message / Activity Badge */}
          <div
            style={{ transform: 'translateZ(15px)' }}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 mb-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80"
          >
            <Headphones className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate italic font-medium">{profile.statusText}</span>
          </div>

          {/* Badges / Tags */}
          <div
            style={{ transform: 'translateZ(12px)' }}
            className="flex flex-wrap items-center justify-center gap-1.5 mb-4"
          >
            {profile.badges.map((badge, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 border border-white/10 text-white/80 hover:border-white/25 transition-colors"
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                {badge}
              </span>
            ))}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 border border-white/10 text-white/80">
              <MapPin className="w-2.5 h-2.5 text-rose-400" />
              {profile.location}
            </span>
          </div>

          {/* Bio Overview ("khái quát về tôi") */}
          <div
            style={{ transform: 'translateZ(10px)' }}
            className="w-full text-left p-3.5 rounded-2xl bg-black/25 border border-white/10 mb-4"
          >
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-white/40 mb-1.5 tracking-wider">
              <span>Khái quát về tôi</span>
              <span className="text-cyan-400">● Live</span>
            </div>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
              {profile.bio}
            </p>
          </div>

          {/* Skills / Interests Chips */}
          <div
            style={{ transform: 'translateZ(10px)' }}
            className="w-full flex flex-wrap gap-1.5 mb-3.5"
          >
            {profile.skills.map((skill, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white/5 border border-white/10 text-white/75"
              >
                #{skill}
              </span>
            ))}
          </div>

          {/* Social Links Interactive Grid */}
          {profile.socialLinks && profile.socialLinks.length > 0 && (
            <div
              style={{ transform: 'translateZ(12px)' }}
              className="w-full grid grid-cols-2 gap-2 mb-4"
            >
              {profile.socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group text-left"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <div
                      className="p-1.5 rounded-lg bg-black/40 border border-white/10 shrink-0 group-hover:scale-110 transition-transform flex items-center justify-center"
                      style={{ color: link.color || '#38bdf8' }}
                    >
                      <BrandIcon platform={link.platform} className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                        {link.platform}
                      </p>
                      <p className="text-xs font-semibold text-white/90 truncate group-hover:text-cyan-300 transition-colors">
                        {link.username}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-white/40 group-hover:text-white shrink-0 transition-transform group-hover:scale-110" />
                </a>
              ))}
            </div>
          )}

          {/* Integrated Music Player */}
          <div
            style={{ transform: 'translateZ(15px)' }}
            className="w-full mb-3"
          >
            <MusicPlayer
              songUrl={profile.songUrl}
              songTitle={profile.songTitle}
              songArtist={profile.songArtist}
              songCover={profile.songCover}
              autoPlay={autoPlayAudio}
              theme={theme}
              initialVolume={profile.defaultVolume}
            />
          </div>

          {/* Bottom stats & profile link footer */}
          <div
            style={{ transform: 'translateZ(10px)' }}
            className="w-full pt-2 flex items-center justify-between text-[11px] font-mono text-white/40 border-t border-white/10"
          >
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{profile.viewsCount.toLocaleString()} lượt xem</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={onExport}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors flex items-center gap-1"
              >
                <Share2 className="w-3 h-3" />
                <span>Xuất hồ sơ</span>
              </button>
              <span>•</span>
              <button
                onClick={onOpenEditModal}
                className="text-white/70 hover:text-white transition-colors flex items-center gap-1"
              >
                <span>Chỉnh sửa</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
