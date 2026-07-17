
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Atom, FileText, Check, X, Lightbulb, Repeat, Trophy, ArrowRight, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import Confetti from '@/components/shared/confetti';
import { useFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const mysteries = [
    {
        name: 'Easy',
        title: "The Case of the Wilting Plant",
        scenario: "A healthy green plant in a sealed glass box starts to wilt and turn yellow after a few days, even though it has enough water and soil.",
        clues: [ "The glass box is airtight.", "The plant was placed in a dark closet.", "Plants need sunlight to perform photosynthesis.", "Photosynthesis produces the food plants need to survive." ],
        hypotheses: [ "The plant has a disease.", "The plant is not getting enough carbon dioxide.", "The plant is not getting enough light.", "The plant is drowning from too much water." ],
        correctHypothesis: "The plant is not getting enough light."
    },
    {
        name: 'Medium',
        title: "The Mystery of the Floating Egg",
        scenario: "An egg sinks to the bottom of a glass of fresh water, but when it's placed in another glass of clear liquid, it floats.",
        clues: [ "Both liquids look identical.", "The second glass contains a large amount of dissolved salt.", "Saltwater is denser than freshwater.", "An object floats if it is less dense than the liquid it is placed in." ],
        hypotheses: [ "The second glass has less water.", "The egg is lighter in the second glass.", "The saltwater is denser, allowing the egg to float.", "The first glass is colder." ],
        correctHypothesis: "The saltwater is denser, allowing the egg to float."
    },
    {
        name: 'Hard',
        title: "The Riddle of the Rusty Nail",
        scenario: "Two iron nails are left outside. One is in a dry, open container. The other is in a container with a little water. After a week, only the nail in the water has rusted.",
        clues: [ "Rusting is a chemical reaction called oxidation.", "Both nails are exposed to oxygen in the air.", "Oxidation of iron happens much faster in the presence of water.", "The dry nail shows no signs of rust." ],
        hypotheses: [ "The wet nail is older.", "Rust is caused by water and oxygen reacting with iron.", "Only sunlight causes rust.", "The dry nail is made of a different metal." ],
        correctHypothesis: "Rust is caused by water and oxygen reacting with iron."
    }
];

type GameState = 'playing' | 'results' | 'all-solved';

export default function ScienceDetectivePage() {
    const { user, firestore } = useFirebase();
    const [gameState, setGameState] = useState<GameState>('playing');
    const [currentMysteryIndex, setCurrentMysteryIndex] = useState(0);
    const [selectedHypothesis, setSelectedHypothesis] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [totalScore, setTotalScore] = useState(0);

    const mystery = mysteries[currentMysteryIndex];
    
    const handleCheckAnswer = () => {
        if (!selectedHypothesis) return;

        const correct = selectedHypothesis === mystery.correctHypothesis;
        setIsCorrect(correct);
        
        if (correct) {
            const pointsToAward = 50;
            setTotalScore(prev => prev + pointsToAward);
            if (user && firestore) {
                 updateDocumentNonBlocking(doc(firestore, 'users', user.uid), { points: increment(pointsToAward) });
            }
        }
        setGameState('results');
    };

    const handleNextMystery = () => {
        if (currentMysteryIndex < mysteries.length - 1) {
            setCurrentMysteryIndex(prev => prev + 1);
            resetStateForNextLevel();
            setGameState('playing');
        } else {
            setGameState('all-solved');
        }
    };
    
    const resetStateForNextLevel = () => {
        setSelectedHypothesis(null);
        setIsCorrect(null);
    }
    
    const playAgain = () => {
        setCurrentMysteryIndex(0);
        setTotalScore(0);
        resetStateForNextLevel();
        setGameState('playing');
    }

    if (gameState === 'all-solved') {
         return (
             <div className="flex flex-col items-center justify-center min-h-[60vh] text-center py-16 relative">
                 <Confetti />
                 <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring' }}>
                    <Card className="w-full max-w-md p-8 shadow-2xl card-glow">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, 0] }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
                            <Trophy className="w-24 h-24 text-yellow-400 mx-auto" />
                        </motion.div>
                        <CardTitle className="text-4xl font-headline mt-4">All Mysteries Solved!</CardTitle>
                        <CardDescription className="text-lg mt-2">You're a master detective!</CardDescription>
                        <div className="my-8 text-left space-y-4">
                            <div className="flex justify-between items-baseline text-xl">
                                <span className="font-medium text-muted-foreground">Total Score:</span>
                                <span className="text-3xl font-bold">{totalScore}</span>
                            </div>
                        </div>
                        <Button size="lg" onClick={playAgain} className="w-full">
                           <Repeat className="mr-2 h-4 w-4"/> Play Again
                        </Button>
                    </Card>
                </motion.div>
            </div>
        )
    }

    if (gameState === 'results') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center py-16">
                 <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring' }}>
                    <Card className="w-full max-w-lg p-8 shadow-2xl card-glow">
                        {isCorrect ? (
                             <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
                                <Check className="w-24 h-24 text-green-500 mx-auto" />
                            </motion.div>
                        ) : (
                             <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
                                <X className="w-24 h-24 text-destructive mx-auto" />
                            </motion.div>
                        )}
                        
                        <CardTitle className="text-4xl font-headline mt-4">{isCorrect ? "Case Solved!" : "Incorrect Hypothesis!"}</CardTitle>
                        <CardDescription className="text-lg mt-2">
                             {isCorrect ? "Excellent work, detective! Your logic is undeniable." : "A good detective re-evaluates the evidence."}
                        </CardDescription>

                        {!isCorrect && (
                            <div className="my-4 p-4 bg-muted/50 rounded-lg">
                                <p className="font-semibold">The correct hypothesis was:</p>
                                <p>"{mystery.correctHypothesis}"</p>
                            </div>
                        )}
                        
                        <div className="flex flex-col gap-2 mt-8">
                            <Button size="lg" onClick={handleNextMystery} className="w-full">
                                {currentMysteryIndex < mysteries.length - 1 ? <><ArrowRight className="mr-2 h-4 w-4"/> Continue to Next Mystery</> : <><Trophy className="mr-2 h-4 w-4"/> See Final Results</>}
                            </Button>
                             <Button size="lg" variant="outline" asChild>
                                <Link href="/games">
                                    <LogOut className="mr-2 h-4 w-4"/> Exit
                                </Link>
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <Card className="shadow-2xl card-glow">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-headline flex items-center justify-center gap-3"><Atom /> Science Detective</CardTitle>
                    <CardDescription>Difficulty: {mystery.name}. Analyze the clues and solve the mystery!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Card className="bg-muted/30">
                        <CardHeader>
                            <CardTitle className="font-headline">{mystery.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{mystery.scenario}</p>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl font-headline flex items-center gap-2"><FileText className="w-5 h-5"/> Clues</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                  {mystery.clues.map((clue, index) => (
                                    <AccordionItem value={`item-${index}`} key={index}>
                                      <AccordionTrigger>Clue #{index + 1}</AccordionTrigger>
                                      <AccordionContent>
                                        {clue}
                                      </AccordionContent>
                                    </AccordionItem>
                                  ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader>
                                <CardTitle className="text-xl font-headline flex items-center gap-2"><Lightbulb className="w-5 h-5"/> Hypotheses</CardTitle>
                                <CardDescription>Select the most likely explanation.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {mystery.hypotheses.map((hyp, index) => {
                                    const isSelected = selectedHypothesis === hyp;
                                    return (
                                        <Button 
                                            key={index}
                                            variant={isSelected ? 'default' : 'outline'}
                                            className="w-full justify-start text-left h-auto py-3"
                                            onClick={() => setSelectedHypothesis(hyp)}
                                        >
                                            {hyp}
                                        </Button>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    </div>

                </CardContent>
                 <AnimatePresence>
                    <CardFooter className="flex-col items-center gap-4 text-center">
                        <Button onClick={handleCheckAnswer} size="lg" disabled={!selectedHypothesis}>
                            Solve the Mystery
                        </Button>
                    </CardFooter>
                 </AnimatePresence>
            </Card>
        </div>
    );
}
