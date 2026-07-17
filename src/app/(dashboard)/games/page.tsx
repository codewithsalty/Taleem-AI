
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Brain, Sailboat, Play, Map, Feather, History, Atom } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const games = [
    {
        title: 'Subject Sprint',
        description: 'Race against the clock to answer questions from a specific subject.',
        icon: <Brain className="w-12 h-12 text-primary" />,
        comingSoon: false,
        href: '/games/subject-sprint'
    },
    {
        title: 'Vocabulary Voyage',
        description: 'Match Urdu words to their English translations in this nautical adventure.',
        icon: <Sailboat className="w-12 h-12 text-blue-500" />,
        comingSoon: false,
        href: '/games/vocabulary-voyage'
    },
    {
        title: 'Timeline Tangle',
        description: 'Unscramble historical events from Pakistan Studies and place them in the correct order.',
        icon: <History className="w-12 h-12 text-amber-600" />,
        comingSoon: false,
        href: '/games/timeline-tangle'
    },
    {
        title: 'Urdu Haroof Hero',
        description: 'Connect falling letters to form correct Urdu words before they disappear.',
        icon: <Feather className="w-12 h-12 text-green-500" />,
        comingSoon: false,
        href: '/games/urdu-haroof-hero'
    },
     {
        title: 'Map Master',
        description: 'Test your geography knowledge by identifying provinces, cities, and rivers on the map.',
        icon: <Map className="w-12 h-12 text-teal-500" />,
        comingSoon: false,
        href: '/games/map-master-pakistan'
    },
    {
        title: 'Science Detective',
        description: 'Solve science mysteries by conducting virtual experiments and analyzing clues.',
        icon: <Atom className="w-12 h-12 text-purple-500" />,
        comingSoon: false,
        href: '/games/science-detective'
    }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};


export default function GamesCenterPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline mb-2">Games Center</h1>
                <p className="text-muted-foreground">
                    Level up your learning with these fun, interactive challenges.
                </p>
            </div>
            
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {games.map((game) => (
                    <motion.div
                        key={game.title}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05, y: -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Card className="flex flex-col h-full transform transition-transform duration-300 shadow-lg hover:shadow-primary/20 card-glow">
                            <CardHeader className="flex-row items-center gap-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    {game.icon}
                                </div>
                                <div>
                                    <CardTitle className="font-headline text-xl">{game.title}</CardTitle>
                                    {game.comingSoon && <span className="text-xs font-semibold text-amber-500">Coming Soon!</span>}
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <CardDescription>{game.description}</CardDescription>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" disabled={game.comingSoon} asChild>
                                    {game.href ? (
                                        <Link href={game.href}>
                                            <Play className="mr-2 h-4 w-4" />
                                            Play
                                        </Link>
                                    ) : (
                                        <span>
                                            <Play className="mr-2 h-4 w-4" />
                                            Play
                                        </span>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}

    