
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Feather, Play, Brain, Repeat, ArrowLeft, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, increment } from 'firebase/firestore';

const words = [
    'کتاب', 'اسکول', 'دوست', 'پاکستان', 'علم', 'قلم', 'میز', 'کرسی', 'پانی', 'دنیا',
    'گھر', 'کام', 'آج', 'کل', 'سورج', 'چاند', 'ستارہ', 'آسمان', 'زمین', 'ہوا',
    'آدمی', 'عورت', 'بچہ', 'خاندان', 'محبت', 'خوشی', 'غم', 'زندگی', 'موت', 'وقت',
    'صبح', 'شام', 'رات', 'دن', 'ہفتہ', 'مہینہ', 'سال', 'رنگ', 'سرخ', 'نیلا',
    'پیلا', 'سبز', 'کالا', 'سفید', 'پھل', 'سیب', 'کیلا', 'آم', 'انگور', 'پھول',
    'گلاب', 'چمیلی', 'سورج مکھی', 'جانور', 'شیر', 'ہاتھی', 'گھوڑا', 'بلی', 'کتا', 'پرندہ',
    'سڑک', 'شہر', 'گاؤں', 'ملک', 'اردو', 'زبان', 'شعر', 'کہانی', 'خبر', 'فن',
    'موسیقی', 'کھیل', 'کرکٹ', 'فٹبال', 'ہاکی', 'کھانا', 'روٹی', 'چاول', 'گوشت', 'سبزی',
    'اچھا', 'برا', 'نیا', 'پرانا', 'بڑا', 'چھوٹا', 'گرم', 'ٹھنڈا', 'خوبصورت', 'بدصورت', 'نام'
];

// A larger set of individual letters for generating decoys
const urduAlphabet = 'اآبپتٹثجچحخدڈذرڑزژسشصضطظعغفقکگلمنںوہیے'.split('');

type Letter = {
  id: number;
  char: string;
  x: number;
  y: number;
};

type GameState = 'menu' | 'playing' | 'gameOver';

export default function UrduHaroofHeroPage() {
    const { user, firestore } = useFirebase();
    const [gameState, setGameState] = useState<GameState>('menu');
    const [letters, setLetters] = useState<Letter[]>([]);
    const [currentWord, setCurrentWord] = useState('');
    const [targetWord, setTargetWord] = useState('');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const letterIdCounter = useRef(0);
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const [finalScore, setFinalScore] = useState(0);

    const resetGame = () => {
        setLetters([]);
        setCurrentWord('');
        setTargetWord('');
        setScore(0);
        setFinalScore(0);
        setTimeLeft(60);
        setFeedback(null);
        letterIdCounter.current = 0;
    };
    
    const startGame = () => {
        resetGame();
        setGameState('playing');
    };
    
    const setupNewRound = useCallback(() => {
        const newTargetWord = words[Math.floor(Math.random() * words.length)];
        setTargetWord(newTargetWord);
        setCurrentWord('');

        const targetLetters = newTargetWord.split('');
        const decoyCount = Math.max(3, 5 - targetLetters.length);
        const decoys = Array.from({ length: decoyCount }, () => urduAlphabet[Math.floor(Math.random() * urduAlphabet.length)]);
        
        const allCharsForRound = [...targetLetters, ...decoys].sort(() => Math.random() - 0.5);

        if (!gameAreaRef.current) return;
        const gameAreaWidth = gameAreaRef.current.offsetWidth;
        
        const newFallingLetters = allCharsForRound.map(char => ({
            id: letterIdCounter.current++,
            char,
            x: Math.random() * (gameAreaWidth - 40),
            y: -40 - Math.random() * 200, // Stagger their entry
        }));

        setLetters(newFallingLetters);
    }, []);

    useEffect(() => {
        if (gameState === 'playing' && targetWord === '') {
            setupNewRound();
        }
    }, [gameState, targetWord, setupNewRound]);

    const endRound = useCallback(() => {
        setGameState('gameOver');
        setFinalScore(score);
        if (user && firestore && score > 0) {
             updateDocumentNonBlocking(doc(firestore, 'users', user.uid), { points: increment(score) });
        }
    }, [score, user, firestore]);

    // Game Timer
    useEffect(() => {
        if (gameState !== 'playing') return;

        if (timeLeft <= 0) {
            endRound();
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(t => t - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [gameState, timeLeft, endRound]);
    
    // Letter Falling
    useEffect(() => {
        if (gameState !== 'playing') return;
        
        const fallInterval = setInterval(() => {
            setLetters(prevLetters => {
                const gameAreaHeight = gameAreaRef.current?.offsetHeight || 600;
                const newLetters = prevLetters
                    .map(l => ({ ...l, y: l.y + 1.5 })) // Slower falling speed
                    .filter(l => l.y < gameAreaHeight);
                
                // If all letters are gone and a new round hasn't started, start one
                if (newLetters.length === 0 && targetWord !== '') {
                     setTimeout(setupNewRound, 1000);
                }

                return newLetters;
            });
        }, 50);

        return () => clearInterval(fallInterval);
    }, [gameState, targetWord, setupNewRound]);


    const handleLetterClick = (letter: Letter) => {
        setCurrentWord(cw => cw + letter.char);
        setLetters(l => l.filter(l => l.id !== letter.id));
    };

    const checkWord = () => {
        if (currentWord === targetWord) {
            setScore(s => s + targetWord.length * 10);
            setTimeLeft(t => t + 5);
            setFeedback('correct');
             setTimeout(() => {
                setFeedback(null);
                setupNewRound();
            }, 500);
        } else {
            setScore(s => Math.max(0, s - 5));
            setTimeLeft(t => Math.max(0, t - 5));
            setFeedback('incorrect');
            setTimeout(() => setFeedback(null), 500);
        }
        setCurrentWord('');
    };
    
     const handleBackspace = () => {
        setCurrentWord(cw => cw.slice(0, -1));
    };
    
    const getFeedbackClass = () => {
        if (feedback === 'correct') return 'border-green-500 shadow-lg shadow-green-500/20';
        if (feedback === 'incorrect') return 'border-destructive';
        return 'border-border';
    };


    const renderContent = () => {
        switch(gameState) {
            case 'gameOver':
                return (
                    <div className="text-center">
                        <Trophy className="w-24 h-24 text-yellow-400 mx-auto" />
                        <h2 className="text-3xl font-bold mt-4">Game Over!</h2>
                        <p className="text-xl text-muted-foreground mt-2">Your final score is:</p>
                        <p className="text-6xl font-bold my-4">{finalScore}</p>
                        <p className="text-lg text-green-500 font-semibold">You earned {finalScore} points!</p>
                        <Button size="lg" onClick={startGame} className="mt-8">
                            <Repeat className="mr-2 h-5 w-5" /> Play Again
                        </Button>
                    </div>
                );
            case 'playing':
                return (
                    <div className="w-full h-full flex flex-col">
                        <div className="flex justify-between items-center mb-2 p-4 border-b">
                            <div className="text-2xl font-bold">Score: {score}</div>
                            <div className="flex-grow text-center">
                                <p className="text-sm text-muted-foreground">Make this word:</p>
                                <p className="text-2xl font-bold font-urdu tracking-widest">{targetWord}</p>
                            </div>
                            <div className="text-2xl font-bold text-primary">{timeLeft}s</div>
                        </div>
                        <div ref={gameAreaRef} className="flex-grow w-full relative overflow-hidden bg-muted/20">
                             <AnimatePresence>
                                {letters.map(letter => (
                                    <motion.div
                                        key={letter.id}
                                        initial={{ y: letter.y, x: letter.x }}
                                        animate={{ y: letter.y + 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        className="absolute h-12 w-12 flex items-center justify-center bg-card border-2 rounded-lg cursor-pointer font-urdu text-2xl font-bold"
                                        onClick={() => handleLetterClick(letter)}
                                    >
                                        {letter.char}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        <div className="p-4 border-t flex items-center gap-4 bg-background">
                            <motion.div 
                                className={cn("flex-grow h-14 rounded-lg bg-muted flex items-center justify-center font-urdu text-3xl font-bold tracking-widest text-right px-4 border-2 transition-colors", getFeedbackClass())} 
                                dir="rtl"
                                animate={feedback === 'incorrect' ? { x: [-5, 5, -5, 5, 0] } : {}}
                                transition={{ duration: 0.3 }}
                            >
                                {currentWord || <span className="text-muted-foreground text-lg">...لفظ بنائیں</span>}
                            </motion.div>
                             <Button variant="outline" size="icon" onClick={handleBackspace} disabled={!currentWord}>
                                <ArrowLeft />
                            </Button>
                            <Button onClick={checkWord} disabled={!currentWord} className="primary-gradient text-white">
                                Check
                            </Button>
                        </div>
                    </div>
                );
            case 'menu':
            default:
                 return (
                    <div className="text-center">
                        <p className="text-lg text-muted-foreground mb-8">Are you ready to test your Urdu vocabulary?</p>
                        <Button size="lg" onClick={startGame}>
                            <Play className="mr-2 h-5 w-5" />
                            Start Game
                        </Button>
                    </div>
                );
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center py-8">
            <Card className="w-full max-w-2xl h-[70vh] shadow-2xl card-glow flex flex-col overflow-hidden">
                {gameState === 'playing' ? null : (
                    <CardHeader className="text-center">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 15, -15, 0] }} transition={{ type: 'spring', delay: 0.2 }}>
                             <Feather className="w-16 h-16 mx-auto text-green-500" />
                        </motion.div>
                        <CardTitle className="text-4xl font-headline mt-4 font-urdu">اردو حروف ہیرو</CardTitle>
                        <CardDescription>Connect falling letters to form correct Urdu words before they disappear.</CardDescription>
                    </CardHeader>
                )}
                <CardContent className="flex-grow flex items-center justify-center p-0">
                    {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
}
