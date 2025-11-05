'use client';

import { useState, useEffect } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { BottomNavigation } from '@/components/BottomNavigation';
import { FEATURED_MIN_BID, FEATURED_DURATION_HOURS } from '@/lib/constants';

interface Video {
  id: number;
  title: string;
  userId: number;
  user: {
    username: string | null;
  };
  votesCount: number;
  isFeatured: boolean;
  currentBid: number;
  featuredUntil: string | null;
  hasUserVoted?: boolean;
}

export default function PopularVideosPage() {
  const { webApp } = useTelegramWebApp();
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Загрузка данных
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // TODO: Здесь будет запрос к API
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  // Голосование
  const handleVote = async (videoId: number) => {
    try {
      // TODO: API для голосования
      alert('Голос учтён! (Функция будет реализована)');
      loadData();
    } catch (error) {
      alert('Ошибка при голосовании');
    }
  };

  // Ставка на главную
  const handleBidForFeatured = async (videoId: number, bidAmount: number) => {
    if (bidAmount < FEATURED_MIN_BID) {
      alert(`Минимальная ставка: ${FEATURED_MIN_BID} токенов`);
      return;
    }

    if (featuredVideo && bidAmount <= featuredVideo.currentBid) {
      alert(`Ставка должна быть больше ${featuredVideo.currentBid} токенов`);
      return;
    }

    try {
      // TODO: API для ставки
      alert(`Ставка ${bidAmount} токенов принята! (Функция будет реализована)`);
      loadData();
    } catch (error) {
      alert('Ошибка при размещении ставки');
    }
  };

  const calculateTimeLeft = (featuredUntil: string | null) => {
    if (!featuredUntil) return null;

    const end = new Date(featuredUntil).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) return 'Завершено';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}ч ${minutes}м`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center pb-24">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-24">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">🔥 Популярные видео</h1>
          <p className="text-gray-600 text-lg">Голосуй за лучшие видео и размести своё на главной!</p>
        </div>

        {/* Видео дня */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-3xl p-1 shadow-2xl">
            <div className="bg-white rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                  <span>👑</span>
                  <span>Видео дня</span>
                </h2>
                {featuredVideo && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Осталось времени</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {calculateTimeLeft(featuredVideo.featuredUntil)}
                    </div>
                  </div>
                )}
              </div>

              {featuredVideo ? (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{featuredVideo.title}</h3>
                    <p className="text-gray-600">от @{featuredVideo.user.username || 'Аноним'}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">❤️</span>
                        <span className="text-xl font-bold text-gray-800">{featuredVideo.votesCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💎</span>
                        <span className="text-xl font-bold text-gray-800">{featuredVideo.currentBid} токенов</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-xl text-gray-600 mb-4">Главная позиция свободна!</p>
                  <p className="text-gray-500">
                    Поставь свое видео на главную за {FEATURED_MIN_BID} токена на {FEATURED_DURATION_HOURS} часов
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Инструкция */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Как это работает?</h3>
          <div className="space-y-3 text-gray-700">
            <p>• Начальная ставка для видео дня: <strong>{FEATURED_MIN_BID} токена</strong></p>
            <p>• Видео находится на главной <strong>{FEATURED_DURATION_HOURS} часа</strong></p>
            <p>• Другие могут перебить ставку, поставив на <strong>1 токен больше</strong></p>
            <p>• При перебитии ставки время обнуляется и начинается заново</p>
            <p>• Голосуй за понравившиеся видео бесплатно!</p>
          </div>
        </div>

        {/* Рейтинг видео */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">🏆 Рейтинг</h2>

          {videos.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🎥</div>
              <p className="text-xl text-gray-600">Пока нет опубликованных видео</p>
              <p className="text-gray-500 mt-2">Стань первым, кто опубликует своё видео!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    {/* Позиция в рейтинге */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`text-4xl font-bold ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          index === 2 ? 'text-orange-600' :
                          'text-gray-300'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{video.title}</h3>
                          <p className="text-sm text-gray-500">@{video.user.username || 'Аноним'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Статистика и действия */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleVote(video.id)}
                          disabled={video.hasUserVoted}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                            video.hasUserVoted
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-pink-500 to-red-500 text-white hover:scale-105 active:scale-95'
                          }`}
                        >
                          <span>❤️</span>
                          <span>{video.votesCount}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
