// Константы для приложения

// Цены
export const TOKENS_PER_VIDEO = 2; // Стоимость генерации одного видео в токенах
export const INITIAL_BONUS = 2; // Приветственный бонус для новых пользователей (хватает на 1 пробное видео)
export const REFERRAL_BONUS = 10; // Бонус за приглашение реферала

// Аукцион "Видео дня"
export const FEATURED_MIN_BID = 2; // Минимальная ставка для размещения на главной (в токенах)
export const FEATURED_DURATION_HOURS = 24; // Длительность размещения на главной (в часах)
export const PUBLISH_VIDEO_COST = 1; // Стоимость публикации видео в галерею (в токенах)

// Типы транзакций
export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  REFERRAL_BONUS: 'referral_bonus',
  VIDEO_GENERATION: 'video_generation',
} as const;

export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];
