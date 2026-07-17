
'use client';

import { motion } from 'framer-motion';
import { Award, ArrowRight } from 'lucide-react';
import Confetti from '@/components/shared/confetti';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

type LevelUpAnimationProps = {
  level: number;
  levelTitle: string;
  onClose: () => void;
};

// Simplified sound generation with Web Audio API
const playLevelUpSound = () => {
    if (typeof window === 'undefined') return;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) return;
  
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
  
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
  
    oscillator.type = 'triangle';
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    
    // Arpeggio
    const playNote = (freq: number, startTime: number) => {
      oscillator.frequency.setValueAtTime(freq, startTime);
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
    };
  
    const now = audioContext.currentTime;
    playNote(261.63, now);      // C4
    playNote(329.63, now + 0.1); // E4
    playNote(392.00, now + 0.2); // G4
    playNote(523.25, now + 0.3); // C5
  
    oscillator.start(now);
    oscillator.stop(now + 0.5);
};

export default function LevelUpAnimation({ level, levelTitle, onClose }: LevelUpAnimationProps) {

    useEffect(() => {
        playLevelUpSound();
    }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <Confetti />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 15, delay: 0.2 } }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="relative z-10 flex flex-col items-center gap-4 text-white p-8 rounded-2xl"
      >
        <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0, transition: { delay: 0.5, type: 'spring', stiffness: 150 } }}
            className="relative w-40 h-40 flex items-center justify-center"
            style={{ animation: 'badge-glow 2s infinite ease-in-out' }}
        >
            <Award className="absolute w-full h-full text-yellow-400" strokeWidth={1} />
            <span className="relative z-10 text-5xl font-bold font-headline text-background" style={{textShadow: '0 2px 5px rgba(0,0,0,0.5)'}}>{level}</span>
        </motion.div>
        
        <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 0.8 } }}
            className="text-5xl font-headline font-bold text-shadow-lg" 
            style={{ textShadow: '0 4px 15px rgba(0,0,0,0.4)' }}
        >
            Level Up!
        </motion.h1>

        <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 1.0 } }}
            className="text-xl text-white/80"
        >
            You've reached <span className="font-bold text-yellow-300">{levelTitle}</span> status!
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 1.2 } }}
        >
            <Button onClick={onClose} size="lg" className="mt-6 font-bold">
                Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
