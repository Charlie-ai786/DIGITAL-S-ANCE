import React, { useEffect, useRef } from 'react';

export const AtmosphericBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Motes of dust & spirit embers
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      fadeSpeed: number;
      color: string;
    }

    const particles: Particle[] = [];
    const colors = ['#A78BFA', '#39E6B0', '#9CA3AF', '#F5F3FF'];

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.6,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: -Math.random() * 0.45 - 0.1, // Float upward like embers
        opacity: Math.random() * 0.6 + 0.15,
        fadeSpeed: (Math.random() * 0.008 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render floating embers
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += p.fadeSpeed;

        if (p.opacity > 0.75 || p.opacity < 0.1) {
          p.fadeSpeed = -p.fadeSpeed;
        }

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
        ctx.shadowBlur = p.size * 3;
        ctx.shadowColor = p.color;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep Gothic Vignette Gradients */}
      <div className="absolute inset-0 bg-radial from-[#171923]/30 via-[#08090D]/85 to-[#08090D]" />
      
      {/* Candle Light Top Orbs */}
      <div className="absolute -top-32 left-1/4 w-96 h-96 bg-[#A78BFA]/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 -right-32 w-80 h-80 bg-[#39E6B0]/8 rounded-full blur-3xl pointer-events-none" />

      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full opacity-60" />

      {/* Retro-futuristic Subtle Scanlines */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.75) 50%)',
          backgroundSize: '100% 4px',
        }}
      />
    </div>
  );
};
