import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/referral/register
 * Зарегистрировать нового пользователя по реферальной ссылке
 */
export async function POST(request: NextRequest) {
  try {
    const { telegramId, username, referrerTelegramId } = await request.json();

    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegramId is required' },
        { status: 400 }
      );
    }

    // Проверить, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists', user: existingUser },
        { status: 200 }
      );
    }

    // Создать нового пользователя
    const newUser = await prisma.user.create({
      data: {
        telegramId: String(telegramId),
        username: username || null,
      },
    });

    // Если есть реферер, создать связь
    if (referrerTelegramId) {
      const referrer = await prisma.user.findUnique({
        where: { telegramId: String(referrerTelegramId) },
      });

      if (referrer) {
        // Создать запись реферала
        await prisma.referral.create({
          data: {
            referrerId: referrer.id,
            referredId: newUser.id,
          },
        });

        // Получить начало текущей недели (понедельник 00:00)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() + mondayOffset);
        weekStart.setHours(0, 0, 0, 0);

        // Конец недели (воскресенье 23:59:59)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        // Увеличить счетчик новых рефералов для текущей недели
        await prisma.weeklyReferralStats.upsert({
          where: {
            referrerId_weekStart: {
              referrerId: referrer.id,
              weekStart: weekStart,
            },
          },
          create: {
            referrerId: referrer.id,
            weekStart: weekStart,
            weekEnd: weekEnd,
            newReferrals: 1,
          },
          update: {
            newReferrals: { increment: 1 },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      hasReferrer: !!referrerTelegramId,
    });
  } catch (error: any) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
