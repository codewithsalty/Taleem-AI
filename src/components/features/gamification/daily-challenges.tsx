
'use client';

import { Target, Timer, Mic, Copy, CheckCircle, BookCopy, Flame, Check, XCircle, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/shared/empty-state';

const challengeIcons: { [key: string]: React.ReactNode } = {
  'quiz-master': <Target className="w-6 h-6" />,
  'perfect-score': <CheckCircle className="w-6 h-6 text-green-500" />,
  'flashcard-focus': <Copy className="w-6 h-6" />,
  'streak-keeper': <Flame className="w-6 h-6" />,
  'voice-explorer': <Mic className="w-6 h-6" />,
  'subject-switcher': <BookCopy className="w-6 h-6" />,
  'fast-learner': <Timer className="w-6 h-6" />,
};

type Challenge = {
  id: string;
  challengeId: string;
  title: string;
  description: string;
  progress: number;
  goal: number;
  completed: boolean;
};

export default function DailyChallenges() {
  const { firestore, user } = useFirebase();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = Timestamp.fromDate(today);

  const challengesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'daily_challenges'),
      where('expiresAt', '>=', todayTimestamp)
    );
  }, [firestore, user, todayTimestamp.seconds]);

  const { data: challenges, isLoading } = useCollection<Challenge>(challengesQuery);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!challenges || challenges.length === 0) {
    return (
        <Card className="md:col-span-3 bg-muted/50 border-dashed">
            <CardContent className="p-6 text-center">
                <EmptyState 
                    title="No challenges for today!"
                    description="Check back tomorrow for a new set of challenges to earn points."
                    ctaText="Take a Quiz"
                    ctaLink="/quiz-generator"
                />
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {challenges.map((challenge) => {
        const isCompleted = challenge.completed || challenge.progress >= challenge.goal;
        const icon = challengeIcons[challenge.challengeId] || <XCircle />;
        return (
          <Card 
            key={challenge.id}
            className={cn(
                "flex flex-col justify-between transition-all",
                isCompleted ? "bg-green-500/10 border-green-500/50" : "bg-card hover:border-primary/50"
            )}
          >
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className={cn("p-3 rounded-lg -mt-1 -ml-1", isCompleted ? "bg-green-500/20 text-green-500" : "bg-primary/10 text-primary")}>
                        {icon}
                    </div>
                    {isCompleted && (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                            +25 Points
                        </Badge>
                    )}
                </div>
                <CardTitle className="pt-2">{challenge.title}</CardTitle>
                <CardDescription>{challenge.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <Progress 
                        value={(challenge.progress / challenge.goal) * 100} 
                        className={cn("h-2", isCompleted && "[&>div]:bg-green-500")}
                    />
                    <span className="text-sm font-semibold text-muted-foreground">{challenge.progress}/{challenge.goal}</span>
                </div>
            </CardContent>
            <CardFooter>
                 <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Award className="w-3 h-3 text-yellow-500" />
                    Reward: +25 Points
                </p>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
