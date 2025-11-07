import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { REFERRAL_BONUS, TRANSACTION_TYPES } from '@/lib/constants';

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
    // Получаем пользователя с видео
    const user = await prisma.user.findUnique({
      where: { telegramId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Получаем видео отдельно
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
      isPublic: video.isPublic || false
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
      where: { telegramId },
      include: { referrals: { include: { referrer: true } } }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Сохраняем видео
    const video = await prisma.video.create({
      data: {
        title,
        telegramFileId: fileId,
        thumbnailFileId: thumbnailId,
        userId: user.id
      }
    });

    // Если у пользователя есть реферер — начисляем бонус за генерацию видео
    const referral = await prisma.referral.findFirst({ where: { referredId: user.id } });
    if (referral) {
      const referrer = await prisma.user.findUnique({ where: { id: referral.referrerId } });
      if (referrer) {
        await prisma.$transaction([
          prisma.transaction.create({
            data: {
              userId: referrer.id,
              amount: REFERRAL_BONUS,
              type: TRANSACTION_TYPES.REFERRAL_BONUS,
              description: `Бонус за генерацию видео приглашённым пользователем ${user.username || user.telegramId}`
            }
          }),
          prisma.user.update({
            where: { id: referrer.id },
            data: { balance: { increment: REFERRAL_BONUS } }
          })
        ]);
      }
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error saving video:', error);
    return NextResponse.json(
      { error: 'Failed to save video' },
      { status: 500 }
    );
  }
}