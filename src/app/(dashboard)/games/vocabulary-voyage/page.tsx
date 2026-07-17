
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, Repeat, Trophy, ArrowRight, Timer, X, LogOut, CheckCircle, HelpCircle } from 'lucide-react';
import { useFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import Confetti from '@/components/shared/confetti';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

const gameLevels = [
  { level: 1, name: 'Easy', pointsPerMatch: 10, time: 60, words: [ { en: 'Book', ur: 'کتاب' }, { en: 'School', ur: 'اسکول' }, { en: 'Teacher', ur: 'استاد' }, { en: 'Student', ur: 'طالب علم' } ] },
  { level: 2, name: 'Medium', pointsPerMatch: 15, time: 50, words: [ { en: 'Water', ur: 'پانی' }, { en: 'Friend', ur: 'دوست' }, { en: 'House', ur: 'گھر' }, { en: 'Sun', ur: 'سورج' }, { en: 'Moon', ur: 'چاند' } ] },
  { level: 3, name: 'Hard', pointsPerMatch: 20, time: 40, words: [ { en: 'Knowledge', ur: 'علم' }, { en: 'Journey', ur: 'سفر' }, { en: 'Brave', ur: 'بہادر' }, { en: 'Beautiful', ur: 'خوبصورت' }, { en: 'Computer', ur: 'کمپیوٹر' }, { en: 'World', ur: 'دنیا' } ] },
  { level: 4, name: 'Very Hard', pointsPerMatch: 25, time: 30, words: [ { en: 'Freedom', ur: 'آزادی' }, { en: 'Justice', ur: 'انصاف' }, { en: 'To Read', ur: 'پڑھنا' }, { en: 'To Write', ur: 'لکھنا' }, { en: 'Future', ur: 'مستقبل' }, { en: 'History', ur: 'تاریخ' }, { en: 'Science', ur: 'سائنس' } ] },
  { level: 5, name: 'Expert', pointsPerMatch: 30, time: 25, words: [ { en: 'Economy', ur: 'معیشت' }, { en: 'Government', ur: 'حکومت' }, { en: 'Independence', ur: 'خودمختاری' }, { en: 'Environment', ur: 'ماحول' }, { en: 'Technology', ur: 'ٹیکنالوجی' }, { en: 'Culture', ur: 'ثقافت' }, { en: 'Responsibility', ur: 'ذمہ داری' }, { en: 'Success', ur: 'کامیابی' } ] }
];

type Word = {
  id: number;
  text: string;
  lang: 'en' | 'ur';
  pairId: number;
};

type GameState = 'playing' | 'gameOver' | 'voyageComplete' | 'levelComplete';

const shuffleArray = (array: any[]) => {
  return array.map(value => ({ value, sort: Math.random() }))
               .sort((a, b) => a.sort - b.sort)
               .map(({ value }) => value);
};

const GameCard = ({ word, onSelect, isSelected, isMatched, isIncorrect, isDisabled }: { word: Word; onSelect: () => void; isSelected: boolean; isMatched: boolean; isIncorrect: boolean; isDisabled: boolean }) => {
  return (
    <motion.div
        animate={isIncorrect ? { x: [-3, 3, -3, 3, 0] } : {}}
        transition={isIncorrect ? { duration: 0.4 } : {}}
    >
      <button
        onClick={onSelect}
        disabled={isDisabled || isMatched}
        className={cn(
          "w-full h-24 p-2 rounded-lg transition-all duration-300 flex items-center justify-center text-center font-semibold text-lg md:text-xl border-2",
          isMatched
            ? 'bg-green-500/20 border-green-500 opacity-50'
            : isSelected
            ? isIncorrect ? 'bg-destructive/20 border-destructive' : 'bg-primary/20 border-primary shadow-lg'
            : 'bg-card hover:bg-muted/70 border-border'
        )}
      >
        {isMatched ? <Check className="w-8 h-8 text-green-500" /> : <span className={cn('text-foreground', word.lang === 'ur' ? 'font-urdu' : 'font-headline')}>{word.text}</span>}
      </button>
    </motion.div>
  );
};


export default function VocabularyVoyagePage() {
    const { user, firestore } = useFirebase();
    const [gameState, setGameState] = useState<GameState>('playing');
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [words, setWords] = useState<Word[]>([]);
    const [selected, setSelected] = useState<Word[]>([]);
    const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(gameLevels[0].time);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    const setupGame = (levelIndex: number) => {
        const levelData = gameLevels[levelIndex];
        const wordPairs = levelData.words;
        const gameWords: Word[] = [];
        wordPairs.forEach((pair, index) => {
            gameWords.push({ id: index * 2, text: pair.en, lang: 'en', pairId: index });
            gameWords.push({ id: index * 2 + 1, text: pair.ur, lang: 'ur', pairId: index });
        });
        setWords(shuffleArray(gameWords));
        setSelected([]);
        setMatchedPairs([]);
        setScore(0);
        setTimeLeft(levelData.time);
        setCurrentLevelIndex(levelIndex);
        setGameState('playing');
        setFeedback(null);
    };

    useEffect(() => {
        setupGame(0);
    }, []);

    // Timer effect
    useEffect(() => {
        if (gameState !== 'playing' || timeLeft <= 0) {
            if (timeLeft <= 0) {
                setGameState('gameOver');
            }
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(t => t - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [gameState, timeLeft]);


    const handleSelect = (word: Word) => {
        if (selected.length >= 2 || selected.find(s => s.id === word.id) || feedback !== null) return;
        
        const newSelected = [...selected, word];
        setSelected(newSelected);

        if (newSelected.length === 2) {
            const currentPoints = gameLevels[currentLevelIndex].pointsPerMatch;
            if (newSelected[0].pairId === newSelected[1].pairId) {
                // Match found
                setFeedback('correct');
                setMatchedPairs(prev => [...prev, newSelected[0].pairId]);
                const newScore = score + currentPoints;
                setScore(newScore);
                
                setTimeout(() => {
                  setSelected([]);
                  setFeedback(null);
                }, 500);
            } else {
                // No match
                setFeedback('incorrect');
                setTimeLeft(t => Math.max(0, t - 5)); // Deduct 5 seconds
                setTimeout(() => {
                  setSelected([]);
                  setFeedback(null);
                }, 1000);
            }
        }
    };
    
    useEffect(() => {
        const wordPairsInLevel = gameLevels[currentLevelIndex].words.length;
        if (gameState === 'playing' && wordPairsInLevel > 0 && matchedPairs.length === wordPairsInLevel) {
            
            // Level is complete, move to the next one or end the game
            setTimeout(() => {
                if (user && firestore && score > 0) {
                    updateDocumentNonBlocking(doc(firestore, 'users', user.uid), { points: increment(score) });
                }
                 setTotalScore(prevTotal => prevTotal + score);

                if (currentLevelIndex < gameLevels.length - 1) {
                    setGameState('levelComplete');
                } else {
                    setGameState('voyageComplete');
                }
            }, 1000); // Wait a moment before switching level
        }
    }, [matchedPairs, currentLevelIndex, score, user, firestore, gameState]);
    
    const handleRestart = () => {
        setTotalScore(0);
        setupGame(0);
    }

    const handleNextLevel = () => {
        setupGame(currentLevelIndex + 1);
    }

    if (gameState === 'levelComplete') {
        return (
             <div className="flex flex-col items-center justify-center min-h-[60vh] text-center py-16 relative">
                 <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring' }}>
                    <Card className="w-full max-w-md p-8 shadow-2xl card-glow">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, 0] }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
                            <HelpCircle className="w-24 h-24 text-primary mx-auto" />
                        </motion.div>
                        <CardTitle className="text-4xl font-headline mt-4">Next Round?</CardTitle>
                        <CardDescription className="text-lg mt-2">Ready for the next set of words?</CardDescription>
                        <div className="flex w-full gap-4 mt-8">
                            <Button size="lg" onClick={handleNextLevel} className="w-full">
                                Yes
                            </Button>
                            <Button size="lg" variant="outline" asChild className="w-full">
                                <Link href="/games">
                                    No
                                </Link>
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        )
    }

    if (gameState === 'voyageComplete') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center py-16 relative">
                 <Confetti />
                 <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring' }}>
                    <Card className="w-full max-w-md p-8 shadow-2xl card-glow">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, 0] }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
                            <Trophy className="w-24 h-24 text-yellow-400 mx-auto" />
                        </motion.div>
                        <CardTitle className="text-4xl font-headline mt-4">Voyage Complete!</CardTitle>
                        <CardDescription className="text-lg mt-2">You finished all levels!</CardDescription>
                        <div className="my-8 text-left space-y-4">
                             <div className="flex justify-between items-baseline text-xl">
                                <span className="font-medium text-muted-foreground">Total Points Earned:</span>
                                <span className="text-3xl font-bold text-green-500">+{totalScore}</span>
                            </div>
                        </div>
                        <Button size="lg" onClick={handleRestart} className="w-full">
                           <Repeat className="mr-2 h-4 w-4"/> Play Again
                        </Button>
                    </Card>
                </motion.div>
            </div>
        );
    }

    if (gameState === 'gameOver') {
        return (
             <div className="flex flex-col items-center justify-center min-h-[60vh] text-center py-16">
                 <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring' }}>
                    <Card className="w-full max-w-md p-8 shadow-2xl card-glow">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
                            <X className="w-24 h-24 text-destructive mx-auto" />
                        </motion.div>
                        <CardTitle className="text-4xl font-headline mt-4">Time's Up!</CardTitle>
                        <CardDescription className="text-lg mt-2">You ran out of time. Better luck next time!</CardDescription>
                        <Button size="lg" onClick={() => setupGame(currentLevelIndex)} className="w-full mt-8">
                           <Repeat className="mr-2 h-4 w-4"/> Try Again
                        </Button>
                    </Card>
                </motion.div>
            </div>
        )
    }
    
    const currentGridCols = gameLevels[currentLevelIndex].words.length > 6 ? 'md:grid-cols-4' : 'md:grid-cols-3';
    const currentLevelData = gameLevels[currentLevelIndex];

    return (
        <div className="max-w-4xl mx-auto py-8">
            <Card className="shadow-2xl card-glow">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-3xl font-headline">Vocabulary Voyage - {currentLevelData.name}</CardTitle>
                            <CardDescription>Match the English words to their Urdu translation.</CardDescription>
                        </div>
                         <div className="flex items-center gap-2 text-xl font-bold text-primary font-mono">
                            <Timer />
                            <span>{timeLeft}</span>
                        </div>
                    </div>
                    <div className="pt-4">
                        <Progress value={(timeLeft / currentLevelData.time) * 100} className="w-full h-2 [&>div]:bg-primary transition-all duration-1000 linear" />
                    </div>
                </CardHeader>
                <CardContent>
                    <motion.div
                        key={currentLevelIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn("grid grid-cols-2 sm:grid-cols-3 gap-4", currentGridCols)}
                    >
                        {words.map(word => (
                            <motion.div 
                                key={word.id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                            >
                                <GameCard
                                    word={word}
                                    onSelect={() => handleSelect(word)}
                                    isSelected={!!selected.find(s => s.id === word.id)}
                                    isMatched={matchedPairs.includes(word.pairId)}
                                    isIncorrect={feedback === 'incorrect' && !!selected.find(s => s.id === word.id)}
                                    isDisabled={selected.length >= 2}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </CardContent>
            </Card>
        </div>
    );
}

    