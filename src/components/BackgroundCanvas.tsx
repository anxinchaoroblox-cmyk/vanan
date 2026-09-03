import React, { useEffect, useRef } from 'react';
import { ThemePreset } from '../types';

interface BackgroundCanvasProps {
  theme: ThemePreset;
  backgroundUrl: string;
  mousePos: { x: number; y: number };
  backgroundBlur?: number;
  backgroundBrightness?: number;
}

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({
  theme,
  backgroundUrl,
  mousePos,
  backgroundBlur = 3,
  backgroundBrightness = 80
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Parallax starfield effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const stars: Array<{ x: number; y: number; size: number; alpha: number; speed: number }> = [];
    const STAR_COUNT = 70;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        speed: Math.random() * 0.3 + 0.1
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Mouse offset influence
      const normX = (mousePos.x / (window.innerWidth || 1) - 0.5) * 30;
      const normY = (mousePos.y / (window.innerHeight || 1) - 0.5) * 30;

      stars.forEach((star) => {
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = canvas.height;
          star.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(star.x + normX * (star.size * 0.4), star.y + normY * (star.size * 0.4), star.size, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = star.alpha;
        ctx.shadowColor = theme.accentColor;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [mousePos, theme.accentColor]);

  // Smooth parallax offset calculation for background image
  const parallaxX = (mousePos.x / (typeof window !== 'undefined' ? window.innerWidth : 1) - 0.5) * -20;
  const parallaxY = (mousePos.y / (typeof window !== 'undefined' ? window.innerHeight : 1) - 0.5) * -20;

  return (
    <div id="ambient-background" className="fixed inset-0 overflow-hidden pointer-events-none -z-10 select-none">
      {/* Dynamic Background Image with Smooth Parallax */}
      <div
        className="absolute inset-[-40px] bg-cover bg-center transition-transform duration-300 ease-out scale-105"
        style={{
          backgroundImage: `url(${backgroundUrl})`,
          transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
          filter: `blur(${backgroundBlur}px) brightness(${backgroundBrightness / 100})`,
        }}
      />

      {/* Dark Aesthetic Overlay Gradient */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 40%, rgba(10, 12, 18, 0.72) 0%, rgba(5, 7, 12, 0.94) 100%)`,
        }}
      />

      {/* Dynamic Theme Gradient Glows */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full opacity-25 filter blur-[120px] transition-all duration-1000 pointer-events-none"
        style={{
          background: theme.accentColor,
          transform: `translate3d(${parallaxX * 1.5}px, ${parallaxY * 1.5}px, 0)`,
        }}
      />
      <div
        className="absolute -bottom-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full opacity-20 filter blur-[140px] transition-all duration-1000 pointer-events-none"
        style={{
          background: theme.glowColor,
          transform: `translate3d(${-parallaxX * 1.5}px, ${-parallaxY * 1.5}px, 0)`,
        }}
      />

      {/* Canvas for drifting stars/motes */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-80" />

      {/* Vignette border */}
      <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/80 pointer-events-none" />
    </div>
  );
};
