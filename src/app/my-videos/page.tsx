'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  createdAt: string;
}

export default function MyVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { webApp } = useTelegramWebApp();

  useEffect(() => {
    // TODO: Загрузка видео пользователя с сервера
    const fetchVideos = async () => {
      try {
        const userId = webApp?.initDataUnsafe?.user?.id;
        const response = await fetch(`/api/videos?userId=${userId}`);
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('Ошибка при загрузке видео:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [webApp?.initDataUnsafe?.user?.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-white/80">Загрузка видео...</p>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <p className="text-xl mb-4 text-white/80">У вас пока нет сгенерированных видео</p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            Создать видео
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6 text-white">Мои видео</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map((video) => (
          <div 
            key={video.id}
            className="bg-gray-800/50 rounded-xl overflow-hidden backdrop-blur-lg border border-white/10"
          >
            <div className="aspect-video relative">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-white">{video.title}</h3>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">
                  {new Date(video.createdAt).toLocaleDateString()}
                </span>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Открыть
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}