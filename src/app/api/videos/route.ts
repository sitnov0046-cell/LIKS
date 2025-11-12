import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/videos?userId={telegramId}
 * Получить ЛИЧНЫЕ видео конкретного пользователя (для страницы "Мои видео")
 * Возвращает ВСЕ видео пользователя независимо от статуса isPublic
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const telegramId = searchParams.get('userId');

  if (!telegramId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    // Получаем пользователя
    const user = await prisma.user.findUnique({
      where: { telegramId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Получаем ВСЕ видео пользователя (личные и публичные)
    const userVideos = await prisma.video.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    // Преобразуем видео в нужный формат
    const videos = userVideos.map((video: any) => ({
      id: video.id.toString(),
      title: video.title,
      thumbnail: video.thumbnailFileId, // Telegram File ID для превью
      url: `https://t.me/your_bot_username?start=video_${video.telegramFileId}`, // Ссылка на видео через бота
      createdAt: video.createdAt.toISOString(),
      isPublic: video.isPublic || false,
      status: video.status,
      votesCount: video.votesCount || 0
    }));

    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

// Эндпоинт для сохранения нового видео
export async function POST(request: Request) {
  try {
    const { telegramId, title, fileId, thumbnailId } = await request.json();

    const user = await prisma.user.findUnique({
      where: { telegramId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const video = await prisma.video.create({
      data: {
        title,
        prompt: title, // Используем title как prompt по умолчанию
        telegramFileId: fileId,
        thumbnailFileId: thumbnailId,
        userId: user.id,
        tokensCost: 0, // Стоимость 0 для уже созданных видео
        status: 'completed', // Видео уже создано
      }
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error saving video:', error);
    return NextResponse.json(
      { error: 'Failed to save video' },
      { status: 500 }
    );
  }
}