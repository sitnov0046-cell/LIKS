'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  angle: number;
}

export function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const lastShootingStarRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Устанавливаем размер canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    // Генерируем звёзды
    const initStars = () => {
      const stars: Star[] = [];
      const starCount = Math.floor((canvas.width * canvas.height) / 3000); // Плотность звёзд

      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 0.6 + 0.2, // Маленький размер от 0.2 до 0.8
          opacity: Math.random() * 0.4 + 0.2, // Умеренная яркость от 0.2 до 0.6
          twinkleSpeed: Math.random() * 0.02 + 0.005, // Скорость мерцания
          twinklePhase: Math.random() * Math.PI * 2, // Фаза мерцания
        });
      }

      starsRef.current = stars;
    };

    // Создание падающей звезды
    const createShootingStar = () => {
      const shootingStar: ShootingStar = {
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height * 0.5), // Появляется в верхней половине
        length: Math.random() * 80 + 40, // Длина от 40 до 120
        speed: Math.random() * 3 + 2, // Скорость от 2 до 5
        opacity: 0.3, // Ненавязчивая яркость
        angle: Math.PI / 4, // Угол падения (45 градусов)
      };
      shootingStarsRef.current.push(shootingStar);
    };

    // Анимация звёзд
    const animate = () => {
      const currentTime = Date.now();

      // Создаём падающую звезду каждые 5 секунд
      if (currentTime - lastShootingStarRef.current > 5000) {
        createShootingStar();
        lastShootingStarRef.current = currentTime;
      }

      // Создаём тёмный космический фон с галактическим градиентом
      const bgGradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height)
      );

      // Тёмный космический градиент с фиолетовыми оттенками
      bgGradient.addColorStop(0, '#1e1b4b'); // Тёмно-фиолетовый центр (indigo-950)
      bgGradient.addColorStop(0.3, '#312e81'); // Индиго-темный (indigo-900)
      bgGradient.addColorStop(0.5, '#1e3a8a'); // Тёмно-синий (blue-900)
      bgGradient.addColorStop(0.7, '#1e293b'); // Серо-синий (slate-800)
      bgGradient.addColorStop(0.9, '#0f172a'); // Очень тёмный (slate-900)
      bgGradient.addColorStop(1, '#020617'); // Почти черный (slate-950)

      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Добавляем фиолетовые и розовые туманности (галактические облака)
      const nebula1 = ctx.createRadialGradient(
        canvas.width * 0.3,
        canvas.height * 0.3,
        0,
        canvas.width * 0.3,
        canvas.height * 0.3,
        canvas.width * 0.4
      );
      nebula1.addColorStop(0, 'rgba(147, 51, 234, 0.25)'); // Фиолетовый (purple-600)
      nebula1.addColorStop(0.4, 'rgba(168, 85, 247, 0.15)'); // Светлый фиолетовый (purple-500)
      nebula1.addColorStop(0.7, 'rgba(192, 132, 252, 0.08)'); // Бледно-фиолетовый (purple-400)
      nebula1.addColorStop(1, 'rgba(147, 51, 234, 0)');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const nebula2 = ctx.createRadialGradient(
        canvas.width * 0.7,
        canvas.height * 0.6,
        0,
        canvas.width * 0.7,
        canvas.height * 0.6,
        canvas.width * 0.5
      );
      nebula2.addColorStop(0, 'rgba(236, 72, 153, 0.2)'); // Розовый (pink-500)
      nebula2.addColorStop(0.4, 'rgba(244, 114, 182, 0.12)'); // Светлый розовый (pink-400)
      nebula2.addColorStop(0.7, 'rgba(249, 168, 212, 0.06)'); // Бледно-розовый (pink-300)
      nebula2.addColorStop(1, 'rgba(236, 72, 153, 0)');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Добавляем синие галактические туманности
      const nebula3 = ctx.createRadialGradient(
        canvas.width * 0.5,
        canvas.height * 0.8,
        0,
        canvas.width * 0.5,
        canvas.height * 0.8,
        canvas.width * 0.35
      );
      nebula3.addColorStop(0, 'rgba(59, 130, 246, 0.18)'); // Синий (blue-500)
      nebula3.addColorStop(0.5, 'rgba(96, 165, 250, 0.1)'); // Светлый синий (blue-400)
      nebula3.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = nebula3;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Рисуем звёзды
      starsRef.current.forEach((star) => {
        // Мерцание звезды
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
        const currentOpacity = star.opacity * twinkle;

        // Рисуем звезду с эффектом свечения (яркие на тёмном фоне)
        const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 5);
        glow.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity})`);
        glow.addColorStop(0.2, `rgba(200, 220, 255, ${currentOpacity * 0.8})`);
        glow.addColorStop(0.4, `rgba(180, 200, 255, ${currentOpacity * 0.5})`);
        glow.addColorStop(0.7, `rgba(150, 180, 255, ${currentOpacity * 0.2})`);
        glow.addColorStop(1, 'rgba(150, 180, 255, 0)');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 5, 0, Math.PI * 2);
        ctx.fill();

        // Яркое ядро звезды
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Рисуем и обновляем падающие звёзды
      shootingStarsRef.current = shootingStarsRef.current.filter((star) => {
        // Обновляем позицию
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.opacity -= 0.003; // Постепенно исчезает

        // Удаляем, если вышла за пределы или стала невидимой
        if (star.opacity <= 0 || star.x > canvas.width || star.y > canvas.height) {
          return false;
        }

        // Рисуем падающую звезду
        const gradient = ctx.createLinearGradient(
          star.x,
          star.y,
          star.x - Math.cos(star.angle) * star.length,
          star.y - Math.sin(star.angle) * star.length
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        gradient.addColorStop(0.5, `rgba(200, 220, 255, ${star.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(150, 180, 255, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(
          star.x - Math.cos(star.angle) * star.length,
          star.y - Math.sin(star.angle) * star.length
        );
        ctx.stroke();

        return true;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ background: 'transparent' }}
    />
  );
}
