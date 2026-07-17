
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Repeat, Map, Trophy, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import Confetti from '@/components/shared/confetti';
import { pakistanProvinces } from '@/lib/maps/pakistan';
import { usaStates } from '@/lib/maps/usa';


const maps = {
  pakistan: { name: 'Pakistan', regions: pakistanProvinces },
  usa: { name: 'United States', regions: usaStates },
};

type Region = {
  id: string;
  name: string;
  path: string;
};

const shuffleArray = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

type GameState = 'setup' | 'playing' | 'results';

export default function MapMasterPage() {
  const { user, firestore } = useFirebase();
  const [gameState, setGameState] = useState<GameState>('setup');
  const [selectedMap, setSelectedMap] = useState('pakistan');
  const [questions, setQuestions] = useState<Region[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  const startGame = () => {
    const gameRegions = maps[selectedMap as keyof typeof maps].regions;
    setQuestions(shuffleArray(gameRegions));
    setCurrentQuestionIndex(0);
    setScore(0);
    setFeedback(null);
    setGameState('playing');
  }

  const handleRegionClick = (regionId: string) => {
    if (feedback) return;

    let awardedPoints = 0;
    if (regionId === currentQuestion.id) {
      awardedPoints = 10;
      setScore(s => s + awardedPoints);
      setFeedback('correct');

      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(i => i + 1);
          setFeedback(null);
        } else {
          setFinalScore(score + awardedPoints);
          if(user && firestore) {
            updateDocumentNonBlocking(doc(firestore, 'users', user.uid), { points: increment(score + awardedPoints) });
          }
          setGameState('results');
        }
      }, 1000);
    } else {
      setFeedback('incorrect');
      setTimeout(() => {
        setFeedback(null);
      }, 1500);
    }
  };
  
  const resetGame = () => {
    setGameState('setup');
  }

  const allRegionsShuffled = useMemo(() => {
    if (!isMounted) return [];
    return shuffleArray(maps[selectedMap as keyof typeof maps].regions);
  }, [selectedMap, isMounted]);

  if (gameState === 'setup') {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center py-16">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="w-full max-w-md shadow-2xl card-glow">
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline flex items-center justify-center gap-3"><Map /> Map Master</CardTitle>
                        <CardDescription>Select a country to test your geography knowledge.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select value={selectedMap} onValueChange={setSelectedMap}>
                            <SelectTrigger><SelectValue placeholder="Select a country" /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(maps).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>{value.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                    <CardFooter>
                       <Button size="lg" onClick={startGame} className="w-full">
                           <Play className="mr-2 h-4 w-4"/> Start Game
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
  }

  if (gameState === 'results') {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center py-16 relative">
             <Confetti />
             <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring' }}>
                <Card className="w-full max-w-md p-8 shadow-2xl card-glow">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, 0] }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
                        <Trophy className="w-24 h-24 text-yellow-400 mx-auto" />
                    </motion.div>
                    <CardTitle className="text-4xl font-headline mt-4">Congratulations!</CardTitle>
                    <CardDescription className="text-lg mt-2">You've mastered the map of {maps[selectedMap as keyof typeof maps].name}!</CardDescription>
                    <div className="my-8 text-left space-y-4">
                        <div className="flex justify-between items-baseline text-xl">
                            <span className="font-medium text-muted-foreground">Final Score:</span>
                            <span className="text-3xl font-bold">{finalScore}</span>
                        </div>
                         <div className="flex justify-between items-baseline text-xl">
                            <span className="font-medium text-muted-foreground">Points Earned:</span>
                            <span className="text-3xl font-bold text-green-500">+{finalScore}</span>
                        </div>
                    </div>
                    <Button size="lg" onClick={resetGame} className="w-full">
                       <Repeat className="mr-2 h-4 w-4"/> Play Again
                    </Button>
                </Card>
            </motion.div>
        </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-8">
      <Card className="w-full max-w-4xl shadow-2xl card-glow overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline flex items-center justify-center gap-3"><Map /> Map Master: {maps[selectedMap as keyof typeof maps].name}</CardTitle>
          <CardDescription>Click on the correct region.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8">
            <AnimatePresence mode="wait">
                {currentQuestion && (
                  <motion.div
                      key={currentQuestion.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="w-full p-4 bg-primary/10 rounded-lg text-center"
                  >
                      <p className="text-2xl font-bold font-headline text-primary">Click on: {currentQuestion.name}</p>
                  </motion.div>
                )}
            </AnimatePresence>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {allRegionsShuffled.map(p => {
                const isTheAnswer = currentQuestion && p.id === currentQuestion.id;
                const isSelected = feedback !== null && isTheAnswer;
                return (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', delay: Math.random() * 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                         <Card 
                            className={cn(
                                "cursor-pointer transition-all duration-300",
                                "hover:shadow-primary/20 hover:border-primary",
                                isSelected && feedback === 'correct' && 'bg-green-500/10 border-green-500',
                                isSelected && feedback === 'incorrect' && 'bg-destructive/10 border-destructive animate-shake'
                            )}
                            onClick={() => handleRegionClick(p.id)}
                         >
                            <CardContent className="p-4 flex flex-col items-center justify-center gap-2 h-40">
                                <svg viewBox="0 0 100 100" className="w-24 h-24">
                                    <path 
                                        d={p.path} 
                                        className={cn(
                                            "transition-all duration-300 fill-muted-foreground",
                                            isSelected && feedback === 'correct' && "fill-green-500"
                                        )}
                                        stroke="hsl(var(--card))"
                                        strokeWidth="1"
                                    />
                                </svg>
                            </CardContent>
                        </Card>
                    </motion.div>
                )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
