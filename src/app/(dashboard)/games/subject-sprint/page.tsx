
'use client';

import { useState, useEffect, useCallback, useActionState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Timer, Check, X, Loader2, Sparkles, Repeat, Trophy } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { generateQuizAction, type QuizFormState } from '@/lib/actions';
import type { QuizQuestion } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';


const subjects = ['Math', 'Science', 'English', 'Urdu', 'Pakistan Studies'];
const GAME_DURATION = 60; // 60 seconds

type GameState = 'setup' | 'loading' | 'playing' | 'results';

function StartGameButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      {pending ? 'Generating Questions...' : 'Start Sprint'}
    </Button>
  );
}

export default function SubjectSprintPage() {
    const { user, firestore } = useFirebase();
    const [gameState, setGameState] = useState<GameState>('setup');
    const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [finalScore, setFinalScore] = useState(0);

    const initialState: QuizFormState = { message: '', errors: {} };
    const [state, formAction] = useActionState(generateQuizAction, initialState);

    useEffect(() => {
        if (state.quiz) {
            setQuiz(state.quiz);
            setGameState('playing');
        } else if (state.message) {
            // If there's an error from the action, go back to setup
            setGameState('setup');
        }
    }, [state]);


    const endRound = useCallback(() => {
        setGameState('results');
        const totalPointsEarned = score * 2;
        setFinalScore(score);
        if (user && firestore && totalPointsEarned > 0) {
            updateDocumentNonBlocking(doc(firestore, 'users', user.uid), { points: increment(totalPointsEarned) });
        }
    }, [score, user, firestore]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        if (timeLeft <= 0) {
            endRound();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, timeLeft, endRound]);

    const handleAnswer = (answer: string) => {
        if (isAnswered) return;
        setIsAnswered(true);
        setSelectedAnswer(answer);
        
        let awardedPoints = 0;
        if (answer === quiz[currentQuestionIndex].answer) {
            awardedPoints = 1;
            setScore(prev => prev + awardedPoints);
        }

        setTimeout(() => {
            if (currentQuestionIndex < quiz.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setIsAnswered(false);
                setSelectedAnswer(null);
            } else {
                endRound();
            }
        }, 1200);
    };

    const handlePlayAgain = () => {
        setGameState('setup');
        setQuiz([]);
        setCurrentQuestionIndex(0);
        setScore(0);
        setFinalScore(0);
        setTimeLeft(GAME_DURATION);
        setIsAnswered(false);
        setSelectedAnswer(null);
    };
    
    const getOptionClass = (option: string) => {
        if (!isAnswered) return 'bg-muted/30 hover:bg-muted/70';
        
        const question = quiz[currentQuestionIndex];
        const isCorrect = option === question.answer;

        if (isCorrect) return 'bg-green-500/20 border-green-500 shadow-lg shadow-green-500/10';
        if (option === selectedAnswer && !isCorrect) return 'bg-red-500/20 border-red-500 shadow-lg shadow-red-500/10';
        return 'bg-muted/30 opacity-50';
    };

    const getOptionIcon = (option: string) => {
        if (!isAnswered) return null;
        
        const question = quiz[currentQuestionIndex];
        const isCorrect = option === question.answer;

        if (isCorrect) return <Check className="h-5 w-5 text-green-500" />;
        if (option === selectedAnswer && !isCorrect) return <X className="h-5 w-5 text-red-500" />;
        return null;
    }


    if (gameState === 'setup' || gameState === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center py-16">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card className="w-full max-w-md shadow-2xl card-glow">
                        <CardHeader>
                            <CardTitle className="text-3xl font-headline">Subject Sprint</CardTitle>
                            <CardDescription>Race against the clock to answer as many questions as you can!</CardDescription>
                        </CardHeader>
                        <form action={formAction}>
                            <CardContent className="space-y-6">
                                <input type="hidden" name="questionCount" value={15} />
                                <input type="hidden" name="questionType" value="MCQ" />
                                <div className="space-y-2 text-left">
                                    <label className="text-sm font-medium">Subject</label>
                                    <Select name="topic" required>
                                        <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
                                        <SelectContent>
                                            {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-sm font-medium">Difficulty</label>
                                    <Select name="difficulty" defaultValue="Beginner">
                                        <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Beginner">Beginner</SelectItem>
                                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                                            <SelectItem value="Advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {state.message && !state.quiz && (
                                    <Alert variant="destructive"><AlertDescription>{state.message}</AlertDescription></Alert>
                                )}
                            </CardContent>
                            <CardFooter>
                                <StartGameButton />
                            </CardFooter>
                        </form>
                    </Card>
                </motion.div>
            </div>
        );
    }
    
     if (gameState === 'results') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center py-16">
                 <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring' }}>
                    <Card className="w-full max-w-md p-8 shadow-2xl card-glow">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, 0] }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
                            <Trophy className="w-24 h-24 text-yellow-400 mx-auto" />
                        </motion.div>
                        <CardTitle className="text-4xl font-headline mt-4">Time's Up!</CardTitle>
                        <CardDescription className="text-lg mt-2">Here's how you did:</CardDescription>
                        <div className="my-8 text-left space-y-4">
                            <div className="flex justify-between items-baseline text-xl">
                                <span className="font-medium text-muted-foreground">Correct Answers:</span>
                                <span className="text-3xl font-bold">{finalScore}</span>
                            </div>
                            <div className="flex justify-between items-baseline text-xl">
                                <span className="font-medium text-muted-foreground">Points Earned:</span>
                                <span className="text-3xl font-bold text-green-500">+{finalScore * 2}</span>
                            </div>
                        </div>
                        <Button size="lg" onClick={handlePlayAgain} className="w-full">
                            <Repeat className="mr-2 h-4 w-4"/> Play Again
                        </Button>
                    </Card>
                </motion.div>
            </div>
        );
    }

    const currentQuestion = quiz[currentQuestionIndex];
    
    return (
        <div className="max-w-3xl mx-auto py-8">
             <Card className="overflow-hidden shadow-2xl card-glow">
                <CardHeader>
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold font-headline">Subject Sprint</h1>
                        <div className="flex items-center gap-2 text-xl font-bold font-mono text-primary">
                            <Timer className="w-6 h-6" />
                            {timeLeft}s
                        </div>
                    </div>
                     <Progress value={(timeLeft / GAME_DURATION) * 100} className="w-full h-2 [&>div]:bg-primary transition-all duration-1000 linear"/>
                </CardHeader>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CardContent>
                            <h2 className="text-xl md:text-2xl font-semibold mb-6 min-h-[80px]">{currentQuestionIndex + 1}. {currentQuestion.question}</h2>
                            <div className="space-y-4">
                                {currentQuestion.options?.map((option, i) => (
                                <motion.div
                                    key={option}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                   <Button 
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start h-auto min-h-14 py-4 px-4 text-left text-base rounded-lg transition-all duration-300 ease-in-out text-wrap",
                                            getOptionClass(option)
                                        )}
                                        onClick={() => handleAnswer(option)}
                                        disabled={isAnswered}
                                    >
                                        <div className="flex items-center w-full gap-4">
                                            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-background border text-muted-foreground font-bold shrink-0">
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            <span className="flex-grow w-0">{option}</span>
                                            {getOptionIcon(option)}
                                        </div>
                                    </Button>
                                </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </motion.div>
                </AnimatePresence>
             </Card>
        </div>
    );
}

    

    
