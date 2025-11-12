const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Генерация уникального публичного ID
async function generateUniquePublicId() {
  let publicId;
  let isUnique = false;

  while (!isUnique) {
    // Формат: L + 6 цифр (например, L123456)
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    publicId = `L${randomNum}`;

    // Проверяем уникальность
    const existing = await prisma.user.findUnique({
      where: { publicId },
    });

    if (!existing) {
      isUnique = true;
    }
  }

  return publicId;
}

async function migratePublicIds() {
  try {
    console.log('🔄 Starting publicId migration...');

    // Находим всех пользователей без publicId
    const usersWithoutPublicId = await prisma.user.findMany({
      where: {
        OR: [
          { publicId: null },
          { publicId: '' },
        ],
      },
    });

    console.log(`📊 Found ${usersWithoutPublicId.length} users without publicId`);

    if (usersWithoutPublicId.length === 0) {
      console.log('✅ All users already have publicId');
      return;
    }

    // Обновляем каждого пользователя
    let updated = 0;
    for (const user of usersWithoutPublicId) {
      const publicId = await generateUniquePublicId();

      await prisma.user.update({
        where: { id: user.id },
        data: { publicId },
      });

      updated++;
      console.log(`✅ Updated user ${user.telegramId} (${user.username || 'no username'}) -> ${publicId} (${updated}/${usersWithoutPublicId.length})`);
    }

    console.log(`\n🎉 Migration completed! Updated ${updated} users.`);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем миграцию
migratePublicIds()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
