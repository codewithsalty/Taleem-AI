
'use client';

import { useState, useMemo, useEffect } from 'react';
import { type Flashcard } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RefreshCw, ThumbsUp, XCircle, Move, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import EmptyState from '@/components/shared/empty-state';

type FlashcardDisplayProps = {
  flashcards?: Flashcard[];
  isLoading?: boolean;
};

export default function FlashcardDisplay({ flashcards, isLoading }: FlashcardDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  const x = useMotionValue(0);
  const xInput = [-150, 0, 150];
  const backgroundColor = useTransform(x, xInput, [
    "linear-gradient(135deg, hsl(38, 92%, 50%), hsl(28, 80%, 50%))",
    "linear-gradient(135deg, hsl(var(--card)), hsl(var(--card)))",
    "linear-gradient(135deg, hsl(142, 71%, 45%), hsl(142, 61%, 35%))",
  ]);
  const rotate = useTransform(x, xInput, [-10, 0, 10]);

  const deck = useMemo(() => {
    if (!flashcards) return [];
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowSwipeHint(true);
    return flashcards;
  }, [flashcards]);

  useEffect(() => {
    setIsFlipped(false);
    x.set(0);
  }, [currentIndex, x]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-[90vw] md:w-full max-w-xl h-[300px]">
          <Skeleton className="absolute w-full h-full" />
        </div>
        <div className="flex items-center gap-4 mt-4">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
    );
  }

  if (!deck || deck.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center w-[90vw] md:w-full max-w-xl h-[300px] border-dashed">
        <CardContent className="text-center">
          <EmptyState
            title="No Flashcards Yet"
            description="Paste your notes and click 'Generate Flashcards' to start studying."
            ctaText="Generate Flashcards"
            ctaLink="#text"
          />
        </CardContent>
      </Card>
    );
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1));
    if (showSwipeHint) setShowSwipeHint(false);
  };
  
  const handlePrev = () => {
    setCurrentIndex((prev) => (Math.max(0, prev - 1)));
  };

  const currentCard = deck[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  if (currentIndex >= deck.length) {
    return (
         <Card className="flex flex-col items-center justify-center w-[90vw] md:w-full max-w-xl h-[300px]">
            <CardContent className="text-center space-y-4">
            <p className="text-xl font-bold">Deck Complete!</p>
            <p className="text-muted-foreground">You've reviewed all the cards.</p>
            <Button onClick={() => setCurrentIndex(0)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Start Over
            </Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-[90vw] md:w-full max-w-xl h-[320px]" style={{ perspective: '1200px' }}>
        <AnimatePresence>
            <motion.div
                key={currentIndex}
                style={{ x, rotate, background: backgroundColor }}
                drag="x"
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                onDragEnd={(e, { offset, velocity }) => {
                    if (offset.x > 100) {
                        handleNext();
                    } else if (offset.x < -100) {
                        handleNext();
                    }
                }}
                className="absolute w-full h-[300px] cursor-grab"
                initial={{ scale: 0.95, y: -20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                <motion.div
                    className="absolute w-full h-full rounded-lg shadow-2xl"
                    style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.6s' }}
                    onClick={handleFlip}
                >
                    {/* Front of the card */}
                    <div className="absolute w-full h-full backface-hidden">
                        <Card className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                            <p className="text-2xl font-semibold">{currentCard.front}</p>
                        </Card>
                    </div>
                    {/* Back of the card */}
                    <div className="absolute w-full h-full backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
                        <Card className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-secondary">
                            <p className="text-xl text-secondary-foreground">{currentCard.back}</p>
                        </Card>
                    </div>
                </motion.div>
                {showSwipeHint && currentIndex === 0 && (
                    <motion.div 
                        className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 flex items-center gap-2 text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 1 } }}
                    >
                        <Move className="w-4 h-4 pulse-glow" /> Swipe or use buttons
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="flex justify-between items-center w-full max-w-xl">
        <Button variant="ghost" size="icon" onClick={handlePrev} disabled={currentIndex === 0}>
            <ArrowLeft />
        </Button>
        <p className="text-muted-foreground">
            Card {currentIndex + 1} of {deck.length}
        </p>
        <Button variant="ghost" size="icon" onClick={handleNext} disabled={currentIndex >= deck.length -1}>
            <ArrowRight />
        </Button>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <Button variant="outline" className="w-36 h-12" onClick={() => {x.set(-200); setTimeout(handleNext, 100)}}>
          <XCircle className="mr-2 text-destructive"/> Need Review
        </Button>
        <Button 
            className="w-36 h-12 primary-gradient text-white" 
            onClick={() => {x.set(200); setTimeout(handleNext, 100)}}
        >
          <ThumbsUp className="mr-2"/> Got It
        </Button>
      </div>
    </div>
  );
}
