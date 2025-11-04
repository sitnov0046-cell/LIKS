import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { INITIAL_BONUS } from '@/lib/constants';

// Получить информацию о пользователе
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
        videos: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        referrals: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// Создать или обновить пользователя
export async function POST(request: Request) {
  try {
    const { telegramId, username } = await request.json();

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID is required' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { telegramId }
    });

    if (existingUser) {
      // Если пользователь существует, просто обновляем данные
      const updatedUser = await prisma.user.update({
        where: { telegramId },
        data: {
          username,
          updatedAt: new Date()
        }
      });
      return NextResponse.json(updatedUser);
    }

    // Если новый пользователь, создаем его с приветственным бонусом
    const result = await prisma.$transaction(async (tx) => {
      // Создаем пользователя
      const newUser = await tx.user.create({
        data: {
          telegramId,
          username,
          balance: INITIAL_BONUS
        }
      });

      // Создаем транзакцию о приветственном бонусе
      await tx.transaction.create({
        data: {
          userId: newUser.id,
          amount: INITIAL_BONUS,
          type: 'deposit',
          description: 'Приветственный бонус'
        }
      });

      return newUser;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json(
      { error: 'Failed to create/update user' },
      { status: 500 }
    );
  }
}

// Обновить баланс пользователя
export async function PATCH(request: Request) {
  try {
    const { telegramId, balanceChange } = await request.json();

    if (!telegramId || balanceChange === undefined) {
      return NextResponse.json(
        { error: 'Telegram ID and balance change are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { telegramId },
      data: {
        balance: {
          increment: balanceChange
        }
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating balance:', error);
    return NextResponse.json(
      { error: 'Failed to update balance' },
      { status: 500 }
    );
  }
}
