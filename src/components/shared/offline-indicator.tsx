
'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined' && typeof window.navigator.onLine !== 'undefined') {
        setIsOffline(!window.navigator.onLine);
    }
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 pointer-events-none">
      <div className="bg-destructive text-destructive-foreground rounded-full p-2 px-6 shadow-2xl flex items-center gap-3 border border-destructive-foreground/20 backdrop-blur-md">
        <WifiOff className="h-4 w-4 animate-pulse" />
        <p className="text-xs font-bold tracking-tight uppercase">Offline Mode Active</p>
      </div>
    </div>
  );
}
