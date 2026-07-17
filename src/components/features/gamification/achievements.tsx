
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Award, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type AchievementsProps = {
  badgeName: string;
  badgeIcon: React.ReactNode;
};

// Simplified sound generation with Web Audio API
const playSound = (type: 'open' | 'reveal' | 'swoosh') => {
  if (typeof window === 'undefined') return;
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);

  if (type === 'open') {
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.2);
  } else if (type === 'reveal') {
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
  } else if (type === 'swoosh') {
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1500, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
  }

  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
};


const Particles = ({ count = 20 }: { count?: number }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = Math.random() * 360;
      const distance = Math.random() * 100 + 50;
      const size = Math.random() * 10 + 5;
      const duration = Math.random() * 0.5 + 0.5;
      const delay = Math.random() * 0.2;
      const color = `hsl(${Math.random() * 50 + 200}, 90%, 60%)`;

      return (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 rounded-full"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: color,
            animation: `particle-burst ${duration}s ${delay}s ease-out forwards`,
            transform: `rotate(${angle}deg) translateX(${distance}px) rotate(-${angle}deg)`,
          }}
        />
      );
    });
  }, [count]);

  return <>{particles}</>;
};

const TreasureChest = ({ isOpen }: { isOpen: boolean }) => (
  <div className="relative w-48 h-48" style={{ perspective: '1000px' }}>
    <div
      className={cn(
        'absolute w-full h-1/2 bottom-0 bg-yellow-700 border-4 border-yellow-900 rounded-t-lg transition-transform duration-500 ease-in-out',
        'before:absolute before:content-[\'\'] before:w-full before:h-4 before:bg-yellow-900 before:top-0',
        'after:absolute after:content-[\'\'] after:w-4 after:h-4 after:bg-yellow-900 after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2'
      )}
      style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
    />
    <div
      className={cn(
        'absolute w-full h-1/2 top-0 bg-yellow-600 border-4 border-yellow-900 rounded-t-lg transition-transform duration-500 ease-in-out origin-bottom'
      )}
      style={{ transformStyle: 'preserve-3d', transform: isOpen ? 'rotateX(-140deg)' : 'rotateX(0deg)' }}
    >
      <div className="absolute w-full h-full rounded-t-lg" style={{ transform: 'translateZ(2px)' }}></div>
    </div>
  </div>
);


export default function Achievements({ badgeName, badgeIcon }: AchievementsProps) {
  const [stage, setStage] = useState<'idle' | 'dim' | 'chest' | 'open' | 'reveal' | 'corner' | 'done'>('idle');

  useEffect(() => {
    setStage('dim');
    playSound('open');
    const t1 = setTimeout(() => setStage('chest'), 500);
    const t2 = setTimeout(() => { setStage('open'); playSound('reveal'); }, 1500);
    const t3 = setTimeout(() => setStage('reveal'), 1800);
    const t4 = setTimeout(() => { setStage('corner'); playSound('swoosh'); }, 3000);
    const t5 = setTimeout(() => setStage('done'), 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  if (stage === 'done') return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300",
      stage === 'dim' || stage === 'chest' || stage === 'open' || stage === 'reveal' ? "bg-black/70 backdrop-blur-sm" : "bg-transparent pointer-events-none"
    )}>
      {/* Chest */}
      <div className={cn(
        "absolute transition-all duration-500 ease-out",
        stage === 'chest' || stage === 'open' ? 'opacity-100 scale-100' : 'opacity-0 scale-50',
        stage === 'chest' ? 'animate-bounce' : ''
      )} style={{ animationIterationCount: 2 }}>
        <TreasureChest isOpen={stage === 'open' || stage === 'reveal' || stage === 'corner'} />
        {stage === 'open' && <Particles />}
      </div>

      {/* Badge */}
      <div className={cn(
        "absolute flex flex-col items-center gap-2 text-white transition-all duration-300",
        stage === 'reveal' ? 'opacity-100 scale-100' : 'opacity-0 scale-0',
        stage === 'corner' && 'duration-1000'
      )} style={ stage === 'corner' ? {
          animation: 'badge-to-corner 1s ease-in-out forwards',
      } : {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
      }}>
        <div className={cn("p-4 bg-primary/20 rounded-full border-2 border-primary", 
            stage === 'corner' && 'animate-bounce'
        )}>
          {badgeIcon}
        </div>
        <h3 className={cn("text-2xl font-bold font-headline text-white", stage === 'corner' && 'hidden')}>{badgeName}</h3>
        <p className={cn("text-lg", stage === 'corner' && 'hidden')}>Unlocked!</p>
      </div>

    </div>
  );
}
