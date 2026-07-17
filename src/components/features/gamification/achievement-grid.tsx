
'use client';

import { Award, BookOpen, Brain, Flame, Target, Star, BrainCircuit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

const allAchievements = [
  { id: 'first-quiz', name: 'First Quiz', description: 'Complete your first quiz.', icon: <Award />, requiredPoints: 10 },
  { id: 'science-whiz', name: 'Science Whiz', description: 'Score 90% or more in a Science quiz.', icon: <Brain />, requiredPoints: 100 },
  { id: 'bookworm', name: 'Bookworm', description: 'Study for 5 hours.', icon: <BookOpen />, requiredPoints: 200 },
  { id: 'hot-streak', name: 'Hot Streak', description: 'Maintain a 7-day login streak.', icon: <Flame />, requiredPoints: 350 },
  { id: 'quiz-master', name: 'Quiz Master', description: 'Complete 25 quizzes.', icon: <Target />, requiredPoints: 500 },
  { id: 'perfect-score', name: 'Perfect Score', description: 'Get a 100% score on any quiz.', icon: <Star />, requiredPoints: 750 },
  { id: 'ai-tutor-pro', name: 'AI Tutor Pro', description: 'Use the AI Tutor for 1 hour.', icon: <BrainCircuit />, requiredPoints: 1000 },
  { id: 'weekend-warrior', name: 'Weekend Warrior', description: 'Study on a Saturday and Sunday.', icon: <Award />, requiredPoints: 1200 },
];

export default function AchievementGrid() {
  const { user } = useUser();
  const userPoints = user?.points ?? 0;

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {allAchievements.map((ach, index) => {
          const earned = userPoints >= ach.requiredPoints;
          // For unearned achievements, show progress towards them.
          // This is a placeholder logic; a real app would have more complex state.
          const progress = earned ? 100 : Math.min(Math.floor((userPoints / ach.requiredPoints) * 100), 100);

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Card className={cn(
                    "flex flex-col items-center justify-center p-4 transition-all duration-300",
                    earned ? "bg-primary/10 border-primary/50" : "bg-muted/50 grayscale opacity-60",
                    "hover:border-primary hover:-translate-y-1 hover:opacity-100 hover:grayscale-0"
                )}>
                  <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-colors",
                       earned ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
                  )}>
                    {ach.icon}
                  </div>
                  <p className="text-sm font-semibold text-center truncate w-full">{ach.name}</p>
                  {!earned && (
                      <Progress value={progress} className="h-1 mt-2 w-full" />
                  )}
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">{ach.name}</p>
                <p>{ach.description}</p>
                {!earned && <p className="text-xs text-muted-foreground">Progress: {progress}%</p>}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
