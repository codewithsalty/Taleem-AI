
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Check, X, Repeat, History, Trophy, GripVertical, ArrowDown, ArrowUp, ArrowRight, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import Confetti from '@/components/shared/confetti';
import { useFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import Link from 'next/link';

type GameEvent = {
  id: number;
  year: number;
  description: string;
};

const gameLevels: { level: number, name: string, title: string, points: number, events: GameEvent[] }[] = [
    {
        level: 1, name: 'Easy', title: "The Pakistan Movement", points: 50,
        events: [ { id: 1, year: 1885, description: 'Founding of the Indian National Congress' }, { id: 2, year: 1906, description: 'Formation of the All-India Muslim League' }, { id: 3, year: 1930, description: 'Allama Iqbal addresses the Muslim League in Allahabad' }, { id: 4, year: 1940, description: 'The Lahore Resolution (Pakistan Resolution) is passed' }, { id: 5, year: 1947, description: 'Pakistan gains independence' } ]
    },
    {
        level: 2, name: 'Medium', title: "Early Years of Pakistan", points: 70,
        events: [ { id: 1, year: 1948, description: 'Death of Muhammad Ali Jinnah' }, { id: 2, year: 1951, description: 'Assassination of Liaquat Ali Khan' }, { id: 3, year: 1956, description: 'Pakistan becomes a republic (First Constitution)' }, { id: 4, year: 1958, description: 'First martial law imposed by Ayub Khan' }, { id: 5, year: 1965, description: 'Second Indo-Pakistani War' }, { id: 6, year: 1970, description: 'First general elections held in Pakistan' } ]
    },
     {
        level: 3, name: 'Hard', title: "Mid to Late 20th Century", points: 90,
        events: [ { id: 1, year: 1971, description: 'East Pakistan separates to become Bangladesh' }, { id: 2, year: 1973, description: 'The 1973 Constitution of Pakistan is passed' }, { id: 3, year: 1977, description: 'Martial law imposed by General Zia-ul-Haq' }, { id: 4, year: 1988, description: 'Benazir Bhutto becomes the first female Prime Minister' }, { id: 5, year: 1998, description: 'Pakistan conducts nuclear tests' }, { id: 6, year: 1999, description: 'Kargil War with India' } ]
    },
    {
        level: 4, name: 'Very Hard', title: "The Digital Age", points: 100,
        events: [ { id: 1, year: 2001, description: 'Pakistan joins the US-led War on Terror' }, { id: 2, year: 2007, description: 'Assassination of Benazir Bhutto' }, { id: 3, year: 2008, description: 'First democratic transition of power' }, { id: 4, year: 2010, description: '18th Amendment to the Constitution is passed' }, { id: 5, year: 2013, description: 'Launch of the China-Pakistan Economic Corridor (CPEC)' } ]
    },
    {
        level: 5, name: 'Expert', title: "Modern Pakistan", points: 120,
        events: [ { id: 1, year: 2014, description: 'Army Public School Peshawar attack' }, { id: 2, year: 2015, description: 'Operation Zarb-e-Azb intensifies' }, { id: 3, year: 2018, description: 'Imran Khan becomes Prime Minister' }, { id: 4, year: 2020, description: 'COVID-19 pandemic response begins' }, { id: 5, year: 2022, description: 'Widespread flooding affects a third of the country' } ]
    }
];

type GameState = 'playing' | 'results' | 'all-levels-complete';

const shuffleArray = (array: any[]) => array.map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

export default function TimelineTanglePage() {
    const { user, firestore } = useFirebase();
    const [gameState, setGameState] = useState<GameState>('playing');
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [shuffledEvents, setShuffledEvents] = useState<GameEvent[]>([]);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const setupLevel = (levelIndex: number) => {
        if (levelIndex >= gameLevels.length) {
            setGameState('all-levels-complete');
            return;
        }
        const currentLevelData = gameLevels[levelIndex];
        const correctlySortedEvents = [...currentLevelData.events].sort((a, b) => a.year - b.year);
        setShuffledEvents(shuffleArray(correctlySortedEvents));
        setIsCorrect(null);
        setCurrentLevelIndex(levelIndex);
        setGameState('playing');
    }

    useEffect(() => {
        setupLevel(0);
    }, []);

    const checkOrder = () => {
        const sortedById = [...shuffledEvents].sort((a,b) => a.id - b.id);
        const isOrderCorrect = sortedById.every((event, index) => event.id === shuffledEvents[index].id);
        setIsCorrect(isOrderCorrect);
        
        if (isOrderCorrect) {
            const pointsToAward = gameLevels[currentLevelIndex].points;
            if (user && firestore) {
                updateDocumentNonBlocking(doc(firestore, 'users', user.uid), { points: increment(pointsToAward) });
            }
            setTimeout(() => setGameState('results'), 1000);
        } else {
            setTimeout(() => setIsCorrect(null), 2000); // Reset feedback after 2 seconds
        }
    };
    
    const handleNext = () => {
        setupLevel(currentLevelIndex + 1);
    }
    
    const currentLevelData = gameLevels[currentLevelIndex];
    const isLastLevel = currentLevelIndex === gameLevels.length - 1;

    if (gameState === 'all-levels-complete') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center py-16 relative">
                 <Confetti />
                 <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring' }}>
                    <Card className="w-full max-w-md p-8 shadow-2xl card-glow">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, 0] }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
                            <Trophy className="w-24 h-24 text-yellow-400 mx-auto" />
                        </motion.div>
                        <CardTitle className="text-4xl font-headline mt-4">Game Complete!</CardTitle>
                        <CardDescription className="text-lg mt-2">You've mastered all the timelines!</CardDescription>
                        <div className="flex flex-col gap-2 mt-8">
                            <Button size="lg" onClick={() => setupLevel(0)} className="w-full">
                               <Repeat className="mr-2 h-4 w-4"/> Play Again
                            </Button>
                             <Button size="lg" variant="outline" asChild>
                                <Link href="/games">
                                    <LogOut className="mr-2 h-4 w-4"/> Exit to Games
                                </Link>
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        )
    }

    if (gameState === 'results') {
        const pointsAwarded = gameLevels[currentLevelIndex].points;
        return (
             <div className="flex flex-col items-center justify-center min-h-[60vh] text-center py-16 relative">
                 <Confetti />
                 <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring' }}>
                    <Card className="w-full max-w-md p-8 shadow-2xl card-glow">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, 0] }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
                            <Trophy className="w-24 h-24 text-yellow-400 mx-auto" />
                        </motion.div>
                        <CardTitle className="text-4xl font-headline mt-4">Round Complete!</CardTitle>
                        <CardDescription className="text-lg mt-2">You correctly ordered the timeline for "{currentLevelData.title}".</CardDescription>
                        <div className="my-8 text-left space-y-4">
                            <div className="flex justify-between items-baseline text-xl">
                                <span className="font-medium text-muted-foreground">Points Earned:</span>
                                <span className="text-3xl font-bold text-green-500">+{pointsAwarded}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button size="lg" onClick={handleNext} className="w-full">
                               {isLastLevel ? <Trophy className="mr-2 h-4 w-4"/> : <ArrowRight className="mr-2 h-4 w-4"/>}
                               {isLastLevel ? 'Finish Game' : 'Continue to Next Round'}
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
        <div className="max-w-3xl mx-auto py-8">
            <Card className="shadow-2xl card-glow overflow-hidden">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl flex items-center gap-3"><History /> Timeline Tangle</CardTitle>
                    <CardDescription>Difficulty: {currentLevelData.name} - {currentLevelData.title}. Drag the events into chronological order.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mb-4 text-sm font-semibold text-muted-foreground">
                        <div className="flex items-center gap-2"><ArrowUp /> Earliest</div>
                        <div className="flex items-center gap-2">Latest <ArrowDown /></div>
                    </div>
                    <Reorder.Group axis="y" values={shuffledEvents} onReorder={setShuffledEvents}>
                        <AnimatePresence>
                             {shuffledEvents.map((item) => (
                                <Reorder.Item 
                                    key={item.id} 
                                    value={item}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0, transition: { type: 'spring' } }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    whileDrag={{ scale: 1.05, boxShadow: '0px 10px 30px rgba(0,0,0,0.2)' }}
                                >
                                    <div className="flex items-center gap-4 p-4 mb-3 rounded-lg bg-card border-2 cursor-grab active:cursor-grabbing">
                                        <GripVertical className="text-muted-foreground" />
                                        <div className="font-semibold text-lg">{item.description}</div>
                                    </div>
                                </Reorder.Item>
                            ))}
                        </AnimatePresence>
                    </Reorder.Group>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    <Button 
                        size="lg" 
                        onClick={checkOrder}
                        className={cn(
                            "w-full transition-all duration-300",
                            isCorrect === true && "bg-green-500 hover:bg-green-600",
                            isCorrect === false && "bg-destructive hover:bg-destructive/90"
                        )}
                    >
                        {isCorrect === null && 'Check Order'}
                        {isCorrect === true && <><Check className="mr-2"/> Correct!</>}
                        {isCorrect === false && <><X className="mr-2"/> Try Again</>}
                    </Button>
                    {isCorrect === false && <p className="text-sm text-destructive font-semibold">The order isn't quite right. Keep trying!</p>}
                </CardFooter>
            </Card>
        </div>
    );
}
