
'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

type ProgressRingProps = {
  size?: number;
  strokeWidth?: number;
};

export default function ProgressRing({
  size = 160,
  strokeWidth = 16,
}: ProgressRingProps) {
  const { user } = useUser();
  const percentage = user?.progress ?? 0;
  const level = user?.level ?? 1;

  const [currentPercentage, setCurrentPercentage] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (currentPercentage / 100) * circumference;

  useEffect(() => {
    // No need for requestAnimationFrame, CSS transition handles the animation
    setCurrentPercentage(percentage);
  }, [percentage]);
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progress-gradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xs text-muted-foreground">LVL</span>
        <span className="text-5xl font-bold font-headline">
          <Counter target={level} />
        </span>
        <span className="text-sm font-medium text-muted-foreground">{percentage}% to next</span>
      </div>
    </div>
  );
}

const Counter = ({ target }: { target: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let startTime: number;
    const duration = 1000; // Animate over 1 second
    const initialValue = parseInt(ref.current?.textContent || '0', 10);
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const current = Math.floor(easeOutCubic(progress) * (target - initialValue) + initialValue);
      setCount(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [target]);

  return <span ref={ref}>{count}</span>;
}
