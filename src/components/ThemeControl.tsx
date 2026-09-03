import React, { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Sunset, Sunrise, Sparkles, Check, Clock } from 'lucide-react';
import { ThemePreset, ThemeMode } from '../types';
import { THEME_PRESETS } from '../data/defaultProfile';

interface ThemeControlProps {
  currentTheme: ThemePreset;
  themeMode: ThemeMode;
  onSelectTheme: (theme: ThemePreset) => void;
  onToggleThemeMode: (mode: ThemeMode) => void;
  currentTimeString: string;
}

export const ThemeControl: React.FC<ThemeControlProps> = ({
  currentTheme,
  themeMode,
  onSelectTheme,
  onToggleThemeMode,
  currentTimeString
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#theme-control-panel') && !target.closest('#btn-toggle-theme-panel')) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getTimePeriodIcon = (period?: string) => {
    switch (period) {
      case 'morning': return <Sunrise className="w-4 h-4 text-emerald-400" />;
      case 'afternoon': return <Sun className="w-4 h-4 text-amber-400" />;
      case 'sunset': return <Sunset className="w-4 h-4 text-rose-400" />;
      case 'night': return <Moon className="w-4 h-4 text-sky-400" />;
      default: return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-30">
      {/* Floating Pill Button */}
      <button
        id="btn-toggle-theme-panel"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 backdrop-blur-xl text-xs font-mono text-white/90 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          boxShadow: `0 4px 20px -2px ${currentTheme.glowColor}`,
        }}
      >
        <div className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold">{currentTheme.name}</span>
        </div>
        {themeMode === 'realtime' && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
            <Clock className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '6s' }} /> Real-time
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div
          id="theme-control-panel"
          className="absolute right-0 mt-2 w-72 p-3.5 rounded-2xl bg-[#0e111a]/95 border border-white/15 backdrop-blur-2xl shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Giao Diện & Thời Gian
              </h3>
              <p className="text-[11px] text-white/50 font-mono">
                Giờ hiện tại: {currentTimeString}
              </p>
            </div>
          </div>

          {/* Toggle Auto Real-Time Mode */}
          <div className="mb-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-medium text-white">Tự động theo thời gian thực</span>
              </div>
              <button
                id="btn-toggle-realtime-mode"
                onClick={() => onToggleThemeMode(themeMode === 'realtime' ? 'manual' : 'realtime')}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  themeMode === 'realtime' ? 'bg-cyan-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    themeMode === 'realtime' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[10px] text-white/40 mt-1 leading-relaxed">
              Tự động đổi màu nền & ánh sáng theo Sáng / Trưa / Hoàng hôn / Đêm
            </p>
          </div>

          {/* Theme Presets List */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1">
              Danh sách chủ đề:
            </p>
            {THEME_PRESETS.map((t) => {
              const isSelected = currentTheme.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onToggleThemeMode('manual');
                    onSelectTheme(t);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-white/15 border border-white/25 text-white font-medium'
                      : 'hover:bg-white/5 text-white/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/40"
                      style={{ background: t.accentColor }}
                    />
                    <div className="flex items-center gap-1.5 text-xs">
                      {getTimePeriodIcon(t.timePeriod)}
                      <span>{t.nameVi}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
