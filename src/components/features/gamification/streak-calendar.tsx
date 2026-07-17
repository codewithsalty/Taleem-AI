
'use client';

import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUser } from '@/firebase';

export default function StreakCalendar() {
  const { user } = useUser();
  const streakDays: number[] = []; // This would be populated from Firestore in a real scenario
  const currentStreak = user?.streak ?? 0;
  
  const today = new Date();
  const currentDayOfMonth = today.getDate();

  // For visual representation, let's fill the last `currentStreak` days
  for(let i = 0; i < currentStreak; i++) {
    if (currentDayOfMonth - i > 0) {
      streakDays.push(currentDayOfMonth - i);
    }
  }

  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const isStreaked = streakDays.includes(day);
    const isFuture = day > today.getDate();
    return { day, isStreaked, isFuture };
  });

  return (
    <TooltipProvider>
      <div className="grid grid-cols-7 gap-2">
        {days.map(({ day, isStreaked, isFuture }) => (
          <Tooltip key={day}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border",
                  isFuture ? "bg-transparent border-dashed" : "border-solid",
                  isStreaked ? "primary-gradient border-primary" : "bg-muted/50",
                )}
              >
                {isStreaked && <Award className="w-4 h-4 text-white" />}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Day {day}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
