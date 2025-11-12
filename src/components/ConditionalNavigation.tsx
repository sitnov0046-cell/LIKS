'use client';

import { BottomNavigation } from './BottomNavigation';

export function ConditionalNavigation() {
  // Splash screen отключен, поэтому показываем навигацию всегда
  return <BottomNavigation />;
}
