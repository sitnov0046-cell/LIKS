// Утилиты для работы с KIE.AI API

const KIE_AI_API_KEY = process.env.KIE_AI_API_KEY;
const KIE_AI_BASE_URL = process.env.KIE_AI_BASE_URL || 'https://api.kie.ai/v1';

export interface GenerateVideoParams {
  prompt: string;
  model: 'sora-2' | 'veo-3-fast';
  duration: number; // в секундах
  image_url?: string; // опционально, для image-to-video
}

export interface GenerateVideoResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  error_message?: string;
}

export interface CheckJobStatusResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  thumbnail_url?: string;
  error_message?: string;
  progress?: number; // 0-100
}

/**
 * Начать генерацию видео через KIE.AI
 */
export async function generateVideo(params: GenerateVideoParams): Promise<GenerateVideoResponse> {
  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY не установлен');
  }

  const response = await fetch(`${KIE_AI_BASE_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIE_AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: params.model === 'sora-2' ? 'sora-2-standard' : 'veo-3-fast',
      prompt: params.prompt,
      duration: params.duration,
      image_url: params.image_url,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`KIE.AI API error: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Проверить статус генерации видео
 */
export async function checkJobStatus(jobId: string): Promise<CheckJobStatusResponse> {
  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY не установлен');
  }

  const response = await fetch(`${KIE_AI_BASE_URL}/jobs/${jobId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${KIE_AI_API_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`KIE.AI API error: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Скачать видео по URL и загрузить в Telegram
 * (будет реализовано позже через Telegram Bot API)
 */
export async function downloadVideoToBuffer(videoUrl: string): Promise<Buffer> {
  const response = await fetch(videoUrl);

  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
