import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
      where: { telegramId },
      include: {
        videos: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Преобразуем видео в нужный формат
    const videos = user.videos.map(video => ({
      id: video.id,
      title: video.title,
      thumbnail: video.thumbnailFileId, // Telegram File ID для превью
      url: `https://t.me/your_bot_username?start=video_${video.telegramFileId}`, // Ссылка на видео через бота
      createdAt: video.createdAt
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
        telegramFileId: fileId,
        thumbnailFileId: thumbnailId,
        userId: user.id
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