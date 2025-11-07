'use client';

import { useState, useEffect } from 'react';
import { BottomNavigation } from './BottomNavigation';

export function ConditionalNavigation() {
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    // Проверяем, показывали ли splash screen
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');

    if (hasSeenSplash) {
      // Если уже показывали, сразу показываем навигацию
      setShowNav(true);
    } else {
      // Если еще не показывали, ждем когда splash screen закончится
      const checkInterval = setInterval(() => {
        if (sessionStorage.getItem('hasSeenSplash')) {
          setShowNav(true);
          clearInterval(checkInterval);
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }
  }, []);

  // Не рендерим навигацию, пока не закончится splash screen
  if (!showNav) return null;

  return <BottomNavigation />;
}
