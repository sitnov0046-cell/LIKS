# API Documentation

## База данных подключена и настроена

### Структура базы данных:

#### Модели:
1. **User** - Пользователи
2. **Video** - Видео
3. **Referral** - Реферальная система
4. **Transaction** - История транзакций (пополнения, списания, бонусы)

---

## API Endpoints

### 1. Users API (`/api/users`)

#### GET - Получить информацию о пользователе
```
GET /api/users?telegramId=123456789
```

**Ответ:**
```json
{
  "id": 1,
  "telegramId": "123456789",
  "username": "username",
  "balance": 100,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "videos": [...],
  "referrals": [...]
}
```

#### POST - Создать или обновить пользователя
```
POST /api/users
Content-Type: application/json

{
  "telegramId": "123456789",
  "username": "username"
}
```

#### PATCH - Обновить баланс пользователя
```
PATCH /api/users
Content-Type: application/json

{
  "telegramId": "123456789",
  "balanceChange": 10
}
```

---

### 2. Videos API (`/api/videos`)

#### GET - Получить видео пользователя
```
GET /api/videos?userId=123456789
```

**Ответ:**
```json
[
  {
    "id": 1,
    "title": "My Video",
    "thumbnail": "file_id",
    "url": "https://t.me/bot?start=video_file_id",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### POST - Сохранить новое видео
```
POST /api/videos
Content-Type: application/json

{
  "telegramId": "123456789",
  "title": "Video Title",
  "fileId": "telegram_file_id",
  "thumbnailId": "telegram_thumbnail_id"
}
```

---

### 3. Referrals API (`/api/referrals`)

#### GET - Получить список рефералов
```
GET /api/referrals?telegramId=123456789
```

**Ответ:**
```json
{
  "totalReferrals": 5,
  "referrals": [...]
}
```

#### POST - Создать реферальную связь
```
POST /api/referrals
Content-Type: application/json

{
  "referrerTelegramId": "123456789",
  "referredTelegramId": "987654321"
}
```

**Ответ:**
```json
{
  "referral": {...},
  "bonusAwarded": 10
}
```

---

### 4. Transactions API (`/api/transactions`)

#### GET - Получить историю транзакций пользователя
```
GET /api/transactions?telegramId=123456789&limit=50
```

**Параметры:**
- `telegramId` (обязательный) - Telegram ID пользователя
- `limit` (опциональный) - Количество последних транзакций (по умолчанию все)

**Ответ:**
```json
{
  "balance": 100,
  "transactions": [
    {
      "id": 1,
      "userId": 1,
      "amount": 10,
      "type": "referral_bonus",
      "description": "Бонус за приглашение пользователя @username",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "amount": -5,
      "type": "video_generation",
      "description": "Генерация видео",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Типы транзакций:**
- `deposit` - Пополнение баланса
- `withdrawal` - Списание средств
- `referral_bonus` - Бонус за реферала
- `video_generation` - Списание за генерацию видео

#### POST - Создать новую транзакцию
```
POST /api/transactions
Content-Type: application/json

{
  "telegramId": "123456789",
  "amount": 100,
  "type": "deposit",
  "description": "Пополнение баланса"
}
```

**Ответ:**
```json
{
  "transaction": {
    "id": 1,
    "userId": 1,
    "amount": 100,
    "type": "deposit",
    "description": "Пополнение баланса",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "updatedUser": {
    "id": 1,
    "balance": 100,
    ...
  }
}
```

---

## Доступные команды Prisma

```bash
# Сгенерировать Prisma Client
npm run prisma:generate

# Применить изменения схемы к БД (без создания миграций)
npm run prisma:push

# Применить миграции в продакшене
npm run prisma:migrate

# Открыть Prisma Studio для просмотра БД
npm run prisma:studio
```

---

## Переменные окружения (.env)

```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
TELEGRAM_BOT_TOKEN="your_bot_token"
```

---

## Примечания

1. База данных PostgreSQL на Timeweb уже подключена
2. Схема базы данных синхронизирована
3. Prisma Client сгенерирован и готов к использованию
4. Все API endpoints готовы к использованию
5. Реферальная система автоматически начисляет бонус 10 токенов при регистрации реферала
6. История транзакций отображается в разделе "Баланс" веб-приложения
7. Все операции с балансом и транзакциями используют database transactions для атомарности
