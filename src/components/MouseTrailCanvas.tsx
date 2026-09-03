import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
  decay: number;
}

interface MouseTrailCanvasProps {
  accentColor?: string;
  enabled?: boolean;
}

export const MouseTrailCanvas: React.FC<MouseTrailCanvasProps> = ({
  accentColor = '#38bdf8',
  enabled = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: -100,
    y: -100,
    targetX: -100,
    targetY: -100
  });

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = [
      accentColor,
      '#ffffff',
      '#a855f7',
      '#38bdf8',
      '#34d399'
    ];

    const createParticle = (x: number, y: number) => {
      const pCount = Math.random() > 0.4 ? 2 : 1;
      for (let i = 0; i < pCount; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        particles.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          size: Math.random() * 3.5 + 1.2,
          speedX: (Math.random() - 0.5) * 1.8,
          speedY: (Math.random() - 0.5) * 1.8 - 0.3,
          color,
          alpha: 0.9,
          decay: Math.random() * 0.025 + 0.018
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current.targetX = e.clientX;
      cursorRef.current.targetY = e.clientY;
      createParticle(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        cursorRef.current.targetX = touch.clientX;
        cursorRef.current.targetY = touch.clientY;
        createParticle(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth cursor position interpolation
      cursorRef.current.x += (cursorRef.current.targetX - cursorRef.current.x) * 0.25;
      cursorRef.current.y += (cursorRef.current.targetY - cursorRef.current.y) * 0.25;

      // Draw active particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha -= p.decay;
        p.size *= 0.98;

        if (p.alpha <= 0 || p.size <= 0.2) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw subtle glowing cursor ring
      if (cursorRef.current.x > 0 && cursorRef.current.y > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cursorRef.current.x, cursorRef.current.y, 16, 0, Math.PI * 2);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.45;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cursorRef.current.targetX, cursorRef.current.targetY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [accentColor, enabled]);

  return (
    <canvas
      ref={canvasRef}
      id="mouse-trail-canvas"
      className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-300"
    />
  );
};
