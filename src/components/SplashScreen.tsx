'use client';

import { useEffect, useState } from 'react';
import { StarryBackground } from './StarryBackground';

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

export function SplashScreen({ onFinish, duration = 2500 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Начинаем fade out анимацию перед закрытием
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, duration - 500);

    // Полностью скрываем экран
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      onFinish();
    }, duration);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onFinish]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Космический фон */}
      <StarryBackground />

      {/* Светящаяся галактика в центре */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="rounded-full blur-3xl"
          style={{
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.8) 0%, rgba(236, 72, 153, 0.6) 25%, rgba(59, 130, 246, 0.5) 50%, rgba(147, 51, 234, 0.3) 70%, transparent 90%)',
            animation: 'pulse 3s ease-in-out infinite',
            opacity: 0.7
          }}
        />
      </div>

      <div className="text-center relative z-10">
        {/* Большая анимированная иконка */}
        <div className="mb-6">
          <div className="text-9xl animate-bounce filter drop-shadow-2xl">
            🎬
          </div>
        </div>

        {/* Название приложения */}
        <div className="mb-6">
          <div className="text-white font-black tracking-wider" style={{
            fontSize: '3.5rem',
            textShadow: '0 4px 12px rgba(0,0,0,0.4), 0 0 30px rgba(255,255,255,0.3)',
            letterSpacing: '0.1em',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            LIKS
          </div>
          <div className="text-white/90 text-xl mt-2" style={{
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            AI Video Generator
          </div>
        </div>

        {/* Анимированный индикатор загрузки */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-3 h-3 bg-white/80 rounded-full animate-pulse shadow-lg shadow-white/50" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-white/80 rounded-full animate-pulse shadow-lg shadow-white/50" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-white/80 rounded-full animate-pulse shadow-lg shadow-white/50" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      {/* Декоративные элементы на космическом фоне */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl opacity-30 animate-spin-slow">✨</div>
        <div className="absolute bottom-20 right-20 text-6xl opacity-30 animate-spin-slow">🎥</div>
        <div className="absolute top-1/3 right-10 text-5xl opacity-30 animate-bounce">🌟</div>
        <div className="absolute bottom-1/3 left-20 text-5xl opacity-30 animate-bounce">💫</div>
      </div>
    </div>
  );
}
