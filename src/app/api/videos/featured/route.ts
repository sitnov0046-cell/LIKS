import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/videos/featured
 * Получить информацию о текущем featured видео и минимальной ставке
 */
export async function GET() {
  try {
    // Найти текущее видео в "Топ дня"
    const currentFeaturedVideo = await prisma.video.findFirst({
      where: {
        isFeatured: true,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            telegramId: true,
          },
        },
      },
    });

    if (!currentFeaturedVideo) {
      // Нет featured видео - слот свободен
      return NextResponse.json({
        hasFeatured: false,
        minBid: 2,
      });
    }

    // Проверяем, не истёк ли срок размещения (24 часа)
    const now = new Date();
    const featuredUntil = currentFeaturedVideo.featuredUntil
      ? new Date(currentFeaturedVideo.featuredUntil)
      : null;

    if (featuredUntil && featuredUntil > now) {
      // Видео ещё активно в топе
      return NextResponse.json({
        hasFeatured: true,
        featuredVideo: {
          id: currentFeaturedVideo.id,
          title: currentFeaturedVideo.title,
          userId: currentFeaturedVideo.userId,
          userTelegramId: currentFeaturedVideo.user.telegramId,
          currentBid: currentFeaturedVideo.currentBid,
          featuredUntil: currentFeaturedVideo.featuredUntil,
        },
        minBid: currentFeaturedVideo.currentBid + 1,
      });
    } else {
      // Срок истёк - слот свободен
      return NextResponse.json({
        hasFeatured: false,
        minBid: 2,
      });
    }
  } catch (error) {
    console.error('Error fetching featured video info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured video info' },
      { status: 500 }
    );
  }
}
