import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Sparkles, ChevronRight, Disc } from 'lucide-react';
import { ThemePreset } from '../types';

interface WelcomeScreenProps {
  onEnter: () => void;
  theme: ThemePreset;
  avatarUrl: string;
  name: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onEnter,
  theme,
  avatarUrl,
  name
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      id="welcome-overlay"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: 'blur(10px)' }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      onClick={onEnter}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center cursor-pointer select-none bg-[#07090e]/90 backdrop-blur-md px-4 overflow-hidden"
    >
      {/* Background ambient pulse glow */}
      <div
        className="absolute w-96 h-96 rounded-full filter blur-[100px] opacity-25 animate-pulse pointer-events-none transition-colors duration-700"
        style={{ background: theme.accentColor }}
      />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative z-10 flex flex-col items-center max-w-md text-center"
      >
        {/* Avatar preview with rotating vinyl-like ring */}
        <div className="relative mb-6">
          <div
            className="absolute -inset-2 rounded-full opacity-60 filter blur-sm animate-spin"
            style={{
              background: `conic-gradient(from 0deg, ${theme.accentColor}, transparent, ${theme.accentColor})`,
              animationDuration: '6s',
            }}
          />
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/30 shadow-2xl p-0.5 bg-black/50">
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-black/80 border border-white/20 text-cyan-400">
            <Disc className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        {/* Welcome Tagline */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/70 mb-3 tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>Welcome To My World</span>
        </div>

        {/* Name Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 font-display">
          {name}
        </h1>
        <p className="text-sm sm:text-base text-white/60 mb-8 max-w-xs leading-relaxed">
          Không gian cá nhân tương tác & âm nhạc thư giãn
        </p>

        {/* Enter Button Prompt */}
        <motion.button
          id="btn-enter-profile"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative flex items-center gap-3 px-8 py-3.5 rounded-2xl font-semibold text-sm tracking-wider uppercase transition-all duration-300 shadow-xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.accentColor}dd, ${theme.accentColor}88)`,
            color: '#ffffff',
            boxShadow: `0 10px 30px -5px ${theme.glowColor}`,
          }}
        >
          {/* Subtle button sheen */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
          
          <Volume2 className="w-4 h-4 text-white animate-pulse" />
          <span>Nhấn để xem & nghe nhạc</span>
          <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </motion.button>

        <p className="mt-4 text-xs font-mono text-white/40 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          Nhấn bất kỳ đâu trên màn hình để truy cập
        </p>
      </motion.div>
    </motion.div>
  );
};
