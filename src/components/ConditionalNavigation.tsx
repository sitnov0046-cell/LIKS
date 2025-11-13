'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BottomNavigation } from './BottomNavigation';

export function ConditionalNavigation() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Скрываем навигацию на главной странице во время splash screen
    if (pathname === '/') {
      const isLocalhost = window.location.hostname === 'localhost';
      const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');

      if (isLocalhost || !hasSeenSplash) {
        // Показываем навигацию через 2.5 секунды (одновременно с интерфейсом)
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 2500);

        return () => clearTimeout(timer);
      } else {
        // Если splash уже был показан, показываем навигацию сразу
        setIsVisible(true);
      }
    } else {
      // На других страницах показываем навигацию сразу
      setIsVisible(true);
    }
  }, [pathname]);

  if (!isMounted || !isVisible) {
    return null;
  }

  return <BottomNavigation />;
}
