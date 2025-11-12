import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/videos/public
 * Получить только публичные видео для рейтинга
 */
export async function GET() {
  try {
    const publicVideos = await prisma.video.findMany({
      where: {
        isPublic: true,
        status: 'completed', // Только завершённые видео
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            photoUrl: true,
          },
        },
        votes: true,
      },
      orderBy: {
        votesCount: 'desc',
      },
    });

    return NextResponse.json({
      videos: publicVideos.map((video) => ({
        id: video.id,
        title: video.title,
        userId: video.userId,
        user: {
          // Только username для публичности (убираем publicId для узнаваемости)
          username: video.user.username || 'Аноним',
          // photoUrl для отображения аватара
          photoUrl: video.user.photoUrl,
        },
        votesCount: video.votesCount,
        isFeatured: video.isFeatured,
        currentBid: video.currentBid,
        featuredUntil: video.featuredUntil,
        createdAt: video.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching public videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public videos' },
      { status: 500 }
    );
  }
}
