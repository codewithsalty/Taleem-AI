
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/shared/logo';

export default function SplashScreen() {
  const [isMounted, setIsMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
    } else {
      sessionStorage.setItem('hasSeenSplash', 'true');
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2500); // Splash screen duration
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isMounted || !showSplash) {
    return null;
  }

  const containerVariants = {
    initial: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  const logoVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.5 } },
  };

  const taglineVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 1.0 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
    >
      <motion.div variants={logoVariants} initial="initial" animate="animate">
        <Logo className="text-4xl" />
      </motion.div>
      <motion.p
        variants={taglineVariants}
        initial="initial"
        animate="animate"
        className="mt-4 text-lg text-muted-foreground"
      >
        Learn Smarter, Speak Freely.
      </motion.p>
    </motion.div>
  );
}
