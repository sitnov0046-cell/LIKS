import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Получить историю транзакций пользователя
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const telegramId = searchParams.get('telegramId');
  const limit = searchParams.get('limit');

  if (!telegramId) {
    return NextResponse.json(
      { error: 'Telegram ID is required' },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

  const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined
    });

    return NextResponse.json({
      balance: user.balance,
      transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// Создать новую транзакцию
export async function POST(request: Request) {
  try {
    const { telegramId, amount, type, description } = await request.json();


    if (!telegramId || !amount || !type) {
      return NextResponse.json(
        { error: 'Telegram ID, amount, and type are required' },
        { status: 400 }
      );
    }

    // Ограничение на вывод: только если сумма >= 1000 и тип withdrawal
    if (type === 'withdrawal' && amount > 0) {
      return NextResponse.json(
        { error: 'Сумма для вывода должна быть отрицательной (списание)' },
        { status: 400 }
      );
    }
    if (type === 'withdrawal' && Math.abs(amount) < 1000) {
      return NextResponse.json(
        { error: 'Минимальная сумма для вывода — 1000₽' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { telegramId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Используем транзакцию для атомарного обновления баланса и создания записи
    const result = await prisma.$transaction(async (tx) => {
      // Создаем запись о транзакции
  const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          amount,
          type,
          description
        }
      });

      // Обновляем баланс пользователя
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          balance: {
            increment: amount
          }
        }
      });

      return { transaction, updatedUser };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
