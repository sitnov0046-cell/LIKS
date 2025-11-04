import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { REFERRAL_BONUS, TRANSACTION_TYPES } from '@/lib/constants';

// Получить список рефералов пользователя
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const telegramId = searchParams.get('telegramId');

  if (!telegramId) {
    return NextResponse.json(
      { error: 'Telegram ID is required' },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId },
      include: {
        referrals: {
          include: {
            referrer: {
              select: {
                id: true,
                telegramId: true,
                username: true,
                createdAt: true
              }
            }
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

    return NextResponse.json({
      totalReferrals: user.referrals.length,
      referrals: user.referrals
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}

// Создать новую запись о реферале
export async function POST(request: Request) {
  try {
    const { referrerTelegramId, referredTelegramId } = await request.json();

    if (!referrerTelegramId || !referredTelegramId) {
      return NextResponse.json(
        { error: 'Both referrer and referred Telegram IDs are required' },
        { status: 400 }
      );
    }

    // Проверяем, существуют ли оба пользователя
    const referrer = await prisma.user.findUnique({
      where: { telegramId: referrerTelegramId }
    });

    const referred = await prisma.user.findUnique({
      where: { telegramId: referredTelegramId }
    });

    if (!referrer) {
      return NextResponse.json(
        { error: 'Referrer not found' },
        { status: 404 }
      );
    }

    if (!referred) {
      return NextResponse.json(
        { error: 'Referred user not found' },
        { status: 404 }
      );
    }

    // Проверяем, не существует ли уже такая реферальная связь
    const existingReferral = await prisma.referral.findFirst({
      where: {
        referrerId: referrer.id,
        referredId: referred.id
      }
    });

    if (existingReferral) {
      return NextResponse.json(
        { error: 'Referral already exists' },
        { status: 400 }
      );
    }

    // Создаем новую реферальную запись и начисляем бонус в одной транзакции
    const result = await prisma.$transaction(async (tx) => {
      // Создаем реферальную запись
      const referral = await tx.referral.create({
        data: {
          referrerId: referrer.id,
          referredId: referred.id
        }
      });

      // Создаем транзакцию для бонуса
      await tx.transaction.create({
        data: {
          userId: referrer.id,
          amount: REFERRAL_BONUS,
          type: TRANSACTION_TYPES.REFERRAL_BONUS,
          description: `Бонус за приглашение пользователя ${referred.username || referred.telegramId}`
        }
      });

      // Обновляем баланс рефerer
      await tx.user.update({
        where: { id: referrer.id },
        data: {
          balance: {
            increment: REFERRAL_BONUS
          }
        }
      });

      return referral;
    });

    return NextResponse.json({
      referral: result,
      bonusAwarded: REFERRAL_BONUS
    });
  } catch (error) {
    console.error('Error creating referral:', error);
    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    );
  }
}
