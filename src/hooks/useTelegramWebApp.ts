import { useEffect, useState } from 'react';

export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<Window['Telegram']['WebApp'] | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const app = window.Telegram?.WebApp;
    if (app) {
      setWebApp(app);
      app.ready();
      setIsReady(true);
    }
  }, []);

  return { webApp, isReady };
}