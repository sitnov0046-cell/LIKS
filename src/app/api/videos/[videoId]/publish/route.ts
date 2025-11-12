import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/videos/[videoId]/publish
 * Опубликовать видео в публичный рейтинг (аукцион "Топ дня")
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const { telegramId, bidAmount } = await request.json();
    const videoId = parseInt(params.videoId);

    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegramId is required' },
        { status: 400 }
      );
    }

    // Найти пользователя
    const user = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Найти видео и проверить владельца
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    if (video.userId !== user.id) {
      return NextResponse.json(
        { error: 'You can only publish your own videos' },
        { status: 403 }
      );
    }

    // Найти текущее видео в "Топ дня" (если есть)
    const currentFeaturedVideo = await prisma.video.findFirst({
      where: {
        isFeatured: true,
      },
      include: {
        user: true,
      },
    });

    // Определяем минимальную ставку
    let minBid = 2; // Минимальная начальная ставка
    let shouldRemoveCurrentVideo = false;

    if (currentFeaturedVideo) {
      // Проверяем, не истёк ли срок размещения (24 часа)
      const now = new Date();
      const featuredUntil = currentFeaturedVideo.featuredUntil ? new Date(currentFeaturedVideo.featuredUntil) : null;

      if (featuredUntil && featuredUntil > now) {
        // Видео ещё активно в топе
        // Любой пользователь может перебить ставку (свою или чужую)
        minBid = currentFeaturedVideo.currentBid + 1; // На 1 токен больше текущей ставки
        shouldRemoveCurrentVideo = true; // Будем снимать при успешной ставке
      } else {
        // Срок истёк - слот свободен, минимальная ставка 2 токена
        minBid = 2;
        shouldRemoveCurrentVideo = true; // Нужно снять истекшее видео
      }
    }

    // Проверяем ставку
    if (bidAmount < minBid) {
      return NextResponse.json(
        {
          error: `Минимальная ставка: ${minBid} токенов`,
          minBid,
        },
        { status: 400 }
      );
    }

    // Проверяем баланс пользователя
    if (user.balance < bidAmount) {
      return NextResponse.json(
        { error: 'Недостаточно токенов' },
        { status: 400 }
      );
    }

    // Снимаем текущее видео из топа (свое или чужое), если нужно
    if (shouldRemoveCurrentVideo && currentFeaturedVideo) {
      await prisma.video.update({
        where: { id: currentFeaturedVideo.id },
        data: {
          isFeatured: false,
          isPublic: false,
        },
      });
    }

    // Списываем токены
    await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: user.balance - bidAmount,
      },
    });

    // Публикуем новое видео в "Топ дня"
    const featuredUntil = new Date();
    featuredUntil.setHours(featuredUntil.getHours() + 24); // +24 часа

    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        isPublic: true,
        isFeatured: true,
        currentBid: bidAmount,
        featuredUntil: featuredUntil,
      },
    });

    return NextResponse.json({
      success: true,
      video: updatedVideo,
      message: 'Видео размещено в "Топ дня"',
      newBalance: user.balance - bidAmount,
    });
  } catch (error) {
    console.error('Error publishing video:', error);
    return NextResponse.json(
      { error: 'Failed to publish video' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/videos/[videoId]/publish
 * Снять видео с публичного рейтинга
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');
    const videoId = parseInt(params.videoId);

    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegramId is required' },
        { status: 400 }
      );
    }

    // Найти пользователя
    const user = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Найти видео и проверить владельца
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    if (video.userId !== user.id) {
      return NextResponse.json(
        { error: 'You can only unpublish your own videos' },
        { status: 403 }
      );
    }

    // Снять с публикации
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: { isPublic: false },
    });

    return NextResponse.json({
      success: true,
      video: updatedVideo,
      message: 'Видео снято с публичного рейтинга',
    });
  } catch (error) {
    console.error('Error unpublishing video:', error);
    return NextResponse.json(
      { error: 'Failed to unpublish video' },
      { status: 500 }
    );
  }
}
