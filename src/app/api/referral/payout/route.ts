import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getReferralPercent } from '@/config/video-tariffs';

export const dynamic = 'force-dynamic';

/**
 * POST /api/referral/payout
 * Обработать недельные выплаты реферальной программы
 *
 * ВАЖНО: Этот endpoint должен вызываться автоматически по расписанию (cron)
 * в воскресенье в 23:59 или в понедельник в 00:00
 */
export async function POST(request: NextRequest) {
  try {
    // Получить начало ПРЕДЫДУЩЕЙ недели (понедельник 00:00)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() + mondayOffset);
    currentWeekStart.setHours(0, 0, 0, 0);

    // Предыдущая неделя
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(currentWeekStart.getDate() - 7);

    const previousWeekEnd = new Date(previousWeekStart);
    previousWeekEnd.setDate(previousWeekStart.getDate() + 6);
    previousWeekEnd.setHours(23, 59, 59, 999);

    // Получить всех участников предыдущей недели, которым еще не выплатили
    const stats = await prisma.weeklyReferralStats.findMany({
      where: {
        weekStart: previousWeekStart,
        isPaid: false,
        newReferrals: { gt: 0 }, // Только те, кто привлёк хотя бы 1 нового реферала
      },
      orderBy: {
        newReferrals: 'desc', // Сортировка по убыванию НОВЫХ рефералов
      },
    });

    if (stats.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Нет участников для выплаты',
        weekStart: previousWeekStart.toISOString(),
        weekEnd: previousWeekEnd.toISOString(),
      });
    }

    const payouts = [];

    // Обработать каждого участника с учётом равных позиций
    // Позиция определяется по уникальному значению newReferrals
    let currentPosition = 1;
    let previousNewReferrals: number | null = null;

    for (let i = 0; i < stats.length; i++) {
      const stat = stats[i];

      // Если количество новых рефералов отличается от предыдущего участника,
      // переходим на следующую позицию в лидерборде
      if (previousNewReferrals !== null && previousNewReferrals !== stat.newReferrals) {
        currentPosition++;
      }

      previousNewReferrals = stat.newReferrals;

      const position = currentPosition;
      const percent = getReferralPercent(position, stat.newReferrals);
      const payoutAmount = Math.floor((stat.totalSpending * percent) / 100);

      // Обновить статистику с процентом, суммой выплаты и позицией
      await prisma.weeklyReferralStats.update({
        where: { id: stat.id },
        data: {
          leaderboardPosition: position,
          payoutPercent: percent,
          payoutAmount: payoutAmount,
          isPaid: true,
        },
      });

      // Начислить бонус рефереру
      await prisma.user.update({
        where: { id: stat.referrerId },
        data: {
          balance: { increment: payoutAmount },
        },
      });

      // Создать транзакцию
      await prisma.transaction.create({
        data: {
          userId: stat.referrerId,
          amount: payoutAmount,
          type: 'referral_bonus',
          description: `Реферальный бонус за неделю ${previousWeekStart.toLocaleDateString('ru-RU')} - ${previousWeekEnd.toLocaleDateString('ru-RU')} (${position} место, ${percent}%)`,
        },
      });

      payouts.push({
        referrerId: stat.referrerId,
        position,
        newReferrals: stat.newReferrals, // Количество новых рефералов (для позиции)
        totalSpending: stat.totalSpending, // Траты (для выплаты)
        percent,
        payoutAmount,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Выплачено ${stats.length} рефералам`,
      weekStart: previousWeekStart.toISOString(),
      weekEnd: previousWeekEnd.toISOString(),
      totalPayouts: payouts.length,
      payouts,
    });
  } catch (error: any) {
    console.error('Error processing payouts:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/referral/payout?telegramId=123
 * Получить историю выплат для пользователя
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegramId is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Получить историю выплат
    const payoutHistory = await prisma.weeklyReferralStats.findMany({
      where: {
        referrerId: user.id,
        isPaid: true,
      },
      orderBy: {
        weekStart: 'desc',
      },
    });

    // Получить текущую неделю (если есть)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() + mondayOffset);
    currentWeekStart.setHours(0, 0, 0, 0);

    const currentWeekStats = await prisma.weeklyReferralStats.findUnique({
      where: {
        referrerId_weekStart: {
          referrerId: user.id,
          weekStart: currentWeekStart,
        },
      },
    });

    return NextResponse.json({
      currentWeek: currentWeekStats
        ? {
            weekStart: currentWeekStats.weekStart,
            weekEnd: currentWeekStats.weekEnd,
            newReferrals: currentWeekStats.newReferrals,
            totalSpending: currentWeekStats.totalSpending,
            isPaid: currentWeekStats.isPaid,
          }
        : null,
      history: payoutHistory.map((stat) => ({
        weekStart: stat.weekStart,
        weekEnd: stat.weekEnd,
        position: stat.leaderboardPosition,
        newReferrals: stat.newReferrals,
        totalSpending: stat.totalSpending,
        percent: stat.payoutPercent,
        payoutAmount: stat.payoutAmount,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching payout history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
