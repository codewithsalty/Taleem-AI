
'use client';

import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Check, X, HelpCircle } from 'lucide-react';
import { useMemo } from 'react';

type Challenge = {
  id: string;
  completed: boolean;
  expiresAt: Timestamp;
};

// Generates an array of the last 7 days, including today
const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(23, 59, 59, 999); // Set to end of day for comparison
    days.push(d);
  }
  return days;
};

export default function ChallengeHistory() {
  const { firestore, user } = useFirebase();

  // Get the date 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);

  const challengesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'daily_challenges'),
      where('expiresAt', '>=', sevenDaysAgoTimestamp),
      orderBy('expiresAt', 'desc')
    );
  }, [firestore, user, sevenDaysAgoTimestamp.seconds]);

  const { data: challenges, isLoading } = useCollection<Challenge>(challengesQuery);

  const history = useMemo(() => {
    const last7Days = getLast7Days();
    if (!challenges) {
      // If challenges are loading, show an unknown state for all days
      return last7Days.map(day => ({ day, status: 'unknown' }));
    }

    return last7Days.map(day => {
      const dayString = day.toISOString().split('T')[0];
      const challengeForDay = challenges.find(c => c.expiresAt.toDate().toISOString().split('T')[0] === dayString);

      let status: 'completed' | 'missed' | 'unknown' | 'future' = 'unknown';
      if (day.getTime() > new Date().getTime()) {
          status = 'future';
      } else if (challengeForDay) {
          status = challengeForDay.completed ? 'completed' : 'missed';
      }

      return { day, status };
    });
  }, [challenges]);


  if (isLoading) {
    return <Skeleton className="h-[100px] w-full" />;
  }
  
  const relevantChallenges = challenges?.filter(c => c.expiresAt.toMillis() <= Date.now()) ?? [];
  const completedCount = relevantChallenges.filter(c => c.completed).length;
  const totalCount = relevantChallenges.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div>
          <p className="text-2xl font-bold">{completionRate}%</p>
          <p className="text-sm text-muted-foreground">Completion Rate (Last 7 Days)</p>
        </div>
        <div className="flex justify-between items-center gap-2">
          {history.map(({ day, status }, index) => {
            let icon = <HelpCircle className="w-4 h-4 text-muted-foreground/50" />;
            let bgColor = 'bg-muted/30';
            let tooltipText = "No challenge data";

            if (status === 'completed') {
              icon = <Check className="w-4 h-4 text-white" />;
              bgColor = 'bg-green-500';
              tooltipText = 'Completed';
            } else if (status === 'missed') {
              icon = <X className="w-4 h-4 text-white" />;
              bgColor = 'bg-destructive';
              tooltipText = 'Missed';
            } else if (status === 'future') {
              tooltipText = 'Upcoming';
              bgColor = 'bg-transparent border border-dashed';
            }
            
            const dayLabel = dayLabels[day.getDay()];

            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", bgColor)}>
                      {icon}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{dayLabel}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {tooltipText}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
