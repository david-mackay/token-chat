'use client'

import React, { useEffect, useRef } from 'react';

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const chars = '01BUYSELLHODLBTCSOLANAWEI💎🚀'.split('');
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);
    const opacity: number[] = Array(columns).fill(1);
    
    // Track previous characters and their opacities for smoother fade
    const prevChars = Array(columns).fill('');
    const prevOpacities = Array(columns).fill(0);

    const draw = () => {
      // Clear the canvas completely each frame
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.font = `${fontSize}px monospace`;
      
      drops.forEach((drop, i) => {
        // Update previous character's opacity
        if (prevOpacities[i] > 0) {
          const green = Math.random() * 155 + 100;
          context.fillStyle = `rgba(0, ${green}, 0, ${prevOpacities[i]})`;
          context.fillText(prevChars[i], i * fontSize, (drop - 1) * fontSize);
          prevOpacities[i] *= 0.85; // Faster fade for cleaner look
        }

        // Draw current character
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drop * fontSize;

        const green = Math.random() * 155 + 100;
        context.fillStyle = `rgba(0, ${green}, 0, ${opacity[i]})`;
        context.fillText(char, x, y);

        // Store current character for next frame
        prevChars[i] = char;

        if (drop * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
          opacity[i] = 1;
          prevOpacities[i] = 0;
        }
        
        drops[i]++;
        opacity[i] *= 0.95;
      });
    };

    const interval = setInterval(draw, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-40"
      />
    </div>
  );
};

export default MatrixRain;