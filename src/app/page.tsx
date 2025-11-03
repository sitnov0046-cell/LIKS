'use client';

import { useEffect, useState } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import React from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { webApp } = useTelegramWebApp();

  useEffect(() => {
    setIsReady(true);
  }, []);

  const handleGenerate = async () => {
    if (!prompt || isGenerating) return;

    setIsGenerating(true);
    try {
      // TODO: Здесь будет логика генерации видео
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Видео генерируется! Мы уведомим вас, когда оно будет готово.');
    } catch (error) {
      alert('Произошла ошибка при генерации видео');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isReady && webApp) {
      webApp.MainButton.text = 'Сгенерировать видео';
      webApp.MainButton.onClick(() => handleGenerate());
      webApp.expand();
    }
  }, [isReady, prompt]);

  const updatePrompt = (newPrompt: string) => {
    setPrompt(newPrompt);
    if (webApp && isReady) {
      if (newPrompt.trim()) {
        webApp.MainButton.show();
      } else {
        webApp.MainButton.hide();
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="container-center">
        {/* Заголовок */}
        <div>
          <h1 className="main-title">
            AI Video Generator
          </h1>
          <p className="subtitle">
            Создавайте потрясающие видео с помощью Veo 3 и Sora 2
          </p>
        </div>

        {/* Основная секция */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Создать новое видео</h2>
              <p className="text-white/70">
                Опишите видео, которое хотите создать, и наши ИИ помогут воплотить вашу идею в жизнь
              </p>
            </div>

            <textarea
              placeholder="Например: Закат на пляже с пальмами, волны нежно накатывают на берег..."
              value={prompt}
              onChange={(e) => updatePrompt(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 
                focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent h-32 resize-none"
              disabled={isGenerating}
            />

            {!webApp && (
              <div className="flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="px-6 py-3 bg-white/20 rounded-lg font-semibold text-white
                    hover:bg-white/30 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  {isGenerating ? 'Генерация...' : 'Сгенерировать видео'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Особенности */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-6 
            hover:scale-[1.02] transition-transform duration-300">
            <h3 className="text-xl font-semibold mb-3">Veo 3</h3>
            <p className="text-white/70">
              Передовая технология генерации видео с непревзойденным качеством и реалистичностью
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-6 
            hover:scale-[1.02] transition-transform duration-300">
            <h3 className="text-xl font-semibold mb-3">Sora 2</h3>
            <p className="text-white/70">
              Инновационный ИИ от Google для создания кинематографических видеороликов
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}