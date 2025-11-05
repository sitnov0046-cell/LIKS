import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const testUserId = '123456789';

  console.log('Updating test user balance...');

  // Находим тестового пользователя
  const user = await prisma.user.findUnique({
    where: { telegramId: testUserId }
  });

  if (!user) {
    console.log('Test user not found. Creating new user with 2 tokens...');

    await prisma.user.create({
      data: {
        telegramId: testUserId,
        username: 'Test User',
        balance: 2
      }
    });

    await prisma.transaction.create({
      data: {
        userId: (await prisma.user.findUnique({ where: { telegramId: testUserId } }))!.id,
        amount: 2,
        type: 'deposit',
        description: 'Приветственный бонус'
      }
    });

    console.log('✅ Test user created with 2 tokens');
  } else {
    console.log('Test user found. Resetting balance to 2 tokens...');

    // Обновляем баланс
    await prisma.user.update({
      where: { telegramId: testUserId },
      data: { balance: 2 }
    });

    // Удаляем старые транзакции
    await prisma.transaction.deleteMany({
      where: { userId: user.id }
    });

    // Создаём новую транзакцию
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: 2,
        type: 'deposit',
        description: 'Приветственный бонус'
      }
    });

    console.log('✅ Test user balance reset to 2 tokens');
  }

  const updatedUser = await prisma.user.findUnique({
    where: { telegramId: testUserId },
    include: {
      transactions: true
    }
  });

  console.log('\nUpdated user:', updatedUser);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
