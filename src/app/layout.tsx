import './globals.css';
import type { Metadata } from 'next';
import { TelegramScript } from '@/components/TelegramScript';

export const metadata: Metadata = {
  title: 'Video Generator',
  description: 'Generate videos from text using AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <TelegramScript />
        {children}
      </body>
    </html>
  );
}