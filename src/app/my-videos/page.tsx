'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { PUBLISH_VIDEO_COST } from '@/lib/constants';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  createdAt: string;
  isPublic?: boolean;
}

export default function MyVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [publishingVideoId, setPublishingVideoId] = useState<string | null>(null);
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

  const handlePublishVideo = async (videoId: string) => {
    try {
      setPublishingVideoId(videoId);
      // TODO: API для публикации видео
      alert(`Видео будет опубликовано в галерею за ${PUBLISH_VIDEO_COST} токен! (Функция будет реализована)`);

      // Обновляем статус видео локально
      setVideos(videos.map(v =>
        v.id === videoId ? { ...v, isPublic: true } : v
      ));
    } catch (error) {
      alert('Ошибка при публикации видео');
    } finally {
      setPublishingVideoId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200 animate-gradient bg-300% flex flex-col items-center justify-center pb-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Загрузка видео...</p>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200 animate-gradient bg-300% flex flex-col items-center justify-center pb-24">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-xl mb-4 text-gray-700">У вас пока нет сгенерированных видео</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:scale-105 transition-transform shadow-lg"
          >
            Создать первое видео
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200 animate-gradient bg-300% pb-24">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">🎬 Мои видео</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
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
                <h3 className="text-lg font-semibold mb-2 text-gray-800">{video.title}</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </span>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-transform text-sm font-medium"
                    >
                      Открыть
                    </a>
                  </div>

                  {/* Кнопка публикации */}
                  {video.isPublic ? (
                    <div className="flex items-center justify-center gap-2 py-2 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-green-600 font-medium text-sm">✓ Опубликовано</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePublishVideo(video.id)}
                      disabled={publishingVideoId === video.id}
                      className="w-full py-2 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {publishingVideoId === video.id ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          <span>Публикация...</span>
                        </>
                      ) : (
                        <>
                          <span>🔥</span>
                          <span>Добавить в популярные ({PUBLISH_VIDEO_COST} токен)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}