import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, FastForward, Disc3, Radio } from 'lucide-react';
import { ThemePreset } from '../types';
import { ambientAudio } from '../utils/audioSynth';

interface MusicPlayerProps {
  songUrl: string;
  songTitle: string;
  songArtist: string;
  songCover: string;
  autoPlay: boolean;
  theme: ThemePreset;
  initialVolume?: number;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  songUrl,
  songTitle,
  songArtist,
  songCover,
  autoPlay,
  theme,
  initialVolume = 0.75
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // default 3 min until metadata loaded
  const [volume, setVolume] = useState(initialVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync initial volume if changed
  useEffect(() => {
    if (typeof initialVolume === 'number') {
      setVolume(initialVolume);
      if (audioRef.current) {
        audioRef.current.volume = initialVolume;
      }
      ambientAudio.setVolume(initialVolume);
    }
  }, [initialVolume]);

  // Initialize and auto-play on enter
  useEffect(() => {
    setUsingFallback(false);
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.load();

    if (autoPlay) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn("Audio autoplay blocked or failed, activating ambient synth fallback:", err);
            ambientAudio.init();
            ambientAudio.play();
            setUsingFallback(true);
            setIsPlaying(true);
          });
      }
    }
  }, [autoPlay, songUrl]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };

    const onError = () => {
      console.warn("Audio source error, switching to ambient synth fallback");
      setUsingFallback(true);
      ambientAudio.init();
      ambientAudio.play();
      setIsPlaying(true);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [isDragging]);

  // Handle Play/Pause toggle
  const togglePlayPause = () => {
    if (usingFallback) {
      if (isPlaying) {
        ambientAudio.stop();
        setIsPlaying(false);
      } else {
        ambientAudio.play();
        setIsPlaying(true);
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Fallback to synth if play rejected
        ambientAudio.init();
        ambientAudio.play();
        setUsingFallback(true);
        setIsPlaying(true);
      });
    }
  };

  // Seek / Tua function
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * duration;

    setCurrentTime(newTime);
    if (audioRef.current && !usingFallback) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Skip 5 seconds backward/forward
  const skipTime = (seconds: number) => {
    if (audioRef.current && !usingFallback) {
      const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    } else {
      setCurrentTime((prev) => Math.max(0, Math.min(duration, prev + seconds)));
    }
  };

  // Volume slider
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
    ambientAudio.setVolume(newVol);
  };

  const toggleMute = () => {
    if (isMuted) {
      handleVolumeChange(volume || 0.7);
      setIsMuted(false);
    } else {
      if (audioRef.current) audioRef.current.volume = 0;
      ambientAudio.setVolume(0);
      setIsMuted(true);
    }
  };

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  // Visualizer Animation Loop
  useEffect(() => {
    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const barCount = 20;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < barCount; i++) {
        let heightPercent = 0.15;
        if (isPlaying) {
          // Dynamic harmonic rhythmic bounce
          const t = performance.now() * 0.005;
          const wave = Math.sin(t + i * 0.45) * 0.4 + Math.cos(t * 1.5 - i * 0.3) * 0.3 + 0.5;
          heightPercent = Math.max(0.12, Math.min(0.95, wave));
        }

        const barWidth = 3;
        const gap = (canvas.width - barCount * barWidth) / (barCount - 1);
        const x = i * (barWidth + gap);
        const barHeight = heightPercent * canvas.height;
        const y = canvas.height - barHeight;

        ctx.fillStyle = theme.accentColor;
        ctx.globalAlpha = isPlaying ? 0.85 : 0.25;
        ctx.shadowColor = theme.accentColor;
        ctx.shadowBlur = isPlaying ? 4 : 0;

        // Rounded pill visualizer bars
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, theme.accentColor]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      id="music-player-container"
      className="w-full rounded-2xl p-4 bg-black/40 border border-white/10 backdrop-blur-md shadow-lg transition-all duration-300"
    >
      {/* Hidden Audio Tag */}
      <audio
        ref={audioRef}
        src={songUrl}
        preload="auto"
        crossOrigin="anonymous"
      />

      {/* Top row: Track Info & Visualizer */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Spinning album cover */}
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/20 bg-black/60 shadow-md">
            <img
              src={songCover}
              alt={songTitle}
              className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'rotate-animation' : ''}`}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
              <Disc3 className={`w-5 h-5 text-white/80 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-white truncate font-display">
                {songTitle}
              </p>
              {usingFallback && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Radio className="w-2.5 h-2.5" /> Synth
                </span>
              )}
            </div>
            <p className="text-xs text-white/50 truncate font-mono">
              {songArtist}
            </p>
          </div>
        </div>

        {/* Real-time Frequency Bar Visualizer */}
        <canvas
          ref={visualizerCanvasRef}
          width={70}
          height={24}
          className="shrink-0 rounded"
        />
      </div>

      {/* Scrubber Progress Bar (Tua nhạc) */}
      <div className="mb-2">
        <div
          ref={progressBarRef}
          id="music-progress-bar"
          onClick={handleSeek}
          className="relative h-2 w-full bg-white/10 hover:bg-white/15 rounded-full cursor-pointer overflow-hidden group transition-all"
        >
          {/* Progress fill */}
          <div
            className="absolute top-0 bottom-0 left-0 rounded-full transition-all duration-100 ease-out"
            style={{
              width: `${Math.max(0, Math.min(100, progressPercent))}%`,
              background: `linear-gradient(90deg, ${theme.accentColor}, #ffffff)`,
              boxShadow: `0 0 10px ${theme.glowColor}`
            }}
          />
          {/* Hover highlight scrub handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -ml-1 w-2.5 h-2.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Timestamps */}
        <div className="flex justify-between items-center text-[11px] font-mono text-white/50 mt-1 px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between pt-1">
        {/* Skip -5s button */}
        <button
          id="btn-skip-backward"
          onClick={() => skipTime(-5)}
          title="Tua lùi 5 giây"
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Main Play/Pause Button */}
        <button
          id="btn-play-pause"
          onClick={togglePlayPause}
          className="p-3 rounded-full text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${theme.accentColor}, ${theme.accentColor}cc)`,
            boxShadow: `0 4px 16px ${theme.glowColor}`,
          }}
          title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          )}
        </button>

        {/* Skip +5s button */}
        <button
          id="btn-skip-forward"
          onClick={() => skipTime(5)}
          title="Tua tới 5 giây"
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <FastForward className="w-4 h-4" />
        </button>

        {/* Volume & Mute Control */}
        <div className="flex items-center gap-2 ml-2">
          <button
            id="btn-toggle-mute"
            onClick={toggleMute}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            title={isMuted ? "Bật âm thanh" : "Tắt tiếng"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-16 h-1.5 accent-cyan-400 bg-white/20 rounded-lg cursor-pointer transition-all"
            title="Âm lượng"
          />
        </div>
      </div>
    </div>
  );
};
