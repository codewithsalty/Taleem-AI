
'use client';

import { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type VoiceState = 'idle' | 'listening' | 'speaking';

export default function VoiceButton() {
  const [state, setState] = useState<VoiceState>('idle');

  // This useEffect simulates state changes for demonstration purposes.
  // In a real app, this state would be driven by a global state manager
  // that tracks the voice tutor's actual status.
  useEffect(() => {
    const cycleStates = () => {
      setState('listening');
      setTimeout(() => {
        setState('speaking');
        setTimeout(() => {
          setState('idle');
        }, 4000);
      }, 3000);
    };

    const interval = setInterval(cycleStates, 10000); // Cycle every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        size="icon"
        className={cn(
          'relative rounded-full h-20 w-20 primary-gradient text-white shadow-2xl transition-all duration-300 ease-out overflow-visible',
          state === 'idle' && 'animate-subtle-pulse',
          state === 'speaking' && 'animate-hue-rotate'
        )}
      >
        {state === 'listening' && (
          <>
            <span className="ripple"></span>
            <span className="ripple" style={{ animationDelay: '0.2s' }}></span>
            <span className="ripple" style={{ animationDelay: '0.4s' }}></span>
          </>
        )}
        <Mic className="h-10 w-10" />
        <span className="sr-only">Start voice command</span>
      </Button>
    </div>
  );
}
