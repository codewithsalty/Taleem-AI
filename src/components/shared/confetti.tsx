
'use client';

import { useMemo, useState, useEffect } from 'react';

const Confetti = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const confettiParticles = useMemo(() => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981'];
    return Array.from({ length: 100 }).map((_, i) => {
      const color = colors[i % colors.length];
      const style = {
        left: `${Math.random() * 100}%`,
        backgroundColor: color,
        animationDuration: `${Math.random() * 3 + 2}s`, // 2 to 5 seconds
        animationDelay: `${Math.random() * 2}s`,
      };
      return <div key={i} className="confetti" style={style} />;
    });
  }, []);

  if (!isMounted) return null;

  return <div className="absolute inset-0 pointer-events-none">{confettiParticles}</div>;
};

export default Confetti;
