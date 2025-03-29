'use client'

import { useEffect } from 'react'

export function DebugLogger() {
  useEffect(() => {
    console.log('[Debug] RootLayout mounted');
    console.log('[Debug] Current theme class:', document.documentElement.className);
    console.log('[Debug] Current color scheme:', document.documentElement.style.colorScheme);
    
    return () => {
      console.log('[Debug] RootLayout unmounting');
    };
  }, []);

  return null;
} 