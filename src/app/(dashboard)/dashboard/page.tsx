'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Award,
  BrainCircuit,
  Bot,
  ChevronUp,
} from "lucide-react"
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from "recharts"
import { useState, useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import AchievementGrid from "@/components/features/gamification/achievement-grid";
import ProgressRing from "@/components/features/gamification/progress-ring";
import StreakCalendar from "@/components/features/gamification/streak-calendar";
import { motion } from 'framer-motion';
import { useUser, useCollection, useMemoFirebase } from "@/firebase";
import DailyChallenges from "@/components/features/gamification/daily-challenges";
import ChallengeHistory from "@/components/features/gamification/challenge-history";
import DiagnosticQuiz from "@/components/features/gamification/diagnostic-quiz";
import { useTranslation } from "@/hooks/use-translation";
import EmptyState from "@/components/shared/empty-state";
import { ensureDailyChallengesClient } from "@/lib/gamification";
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { QuizResult } from '@/lib/types';
import { subDays, format } from "date-fns";

export default function DashboardPage() {
  const { user, firestore, isUserLoading } = useUser();
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const quizzesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'quiz_history'),
      orderBy('completedAt', 'desc'),
      limit(50)
    );
  }, [firestore, user]);

  const { data: allQuizzes, isLoading: isQuizzesLoading } = useCollection<QuizResult>(quizzesQuery);

  const passedQuizzes = useMemo(() => allQuizzes?.filter(q => q.status === 'Passed'), [allQuizzes]);

  const isLoading = isUserLoading || isQuizzesLoading;

  useEffect(() => {
    if(user && !isUserLoading && firestore){
      ensureDailyChallengesClient(firestore, user.uid);
      const timer = setTimeout(() => {
        if (user.level === 1 && user.points === 0 && !sessionStorage.getItem('diagnosticCompleted')) {
          setShowDiagnostic(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, isUserLoading, firestore]);

  const handleDiagnosticComplete = () => {
    sessionStorage.setItem('diagnosticCompleted', 'true');
    setShowDiagnostic(false);
  }
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  }

  const statCards = useMemo(() => [
      { title: t('currentLevel'), value: `${user?.levelTitle || 'Beginner'} (Lvl ${user?.level || 1})`, change: `${user?.progress ?? 0}% to next level`, icon: ChevronUp },
      { title: t('currentStreak'), value: `${user?.streak ?? 0} Days`, change: "Keep it up!", icon: BrainCircuit },
      { title: t('quizzesPassed'), value: passedQuizzes?.length ?? 0, change: "Successes", icon: Bot },
      { title: t('pointsEarned'), value: formatNumber(user?.points ?? 0), change: "Lifetime total", icon: Award }
  ], [user, passedQuizzes, t]);

  const chartData = useMemo(() => {
    if (!allQuizzes || !isMounted) return { subjectPerformanceData: [], quizAccuracyData: [], weeklyPerformanceData: [] };

    const subjectScores: Map<string, { total: number; count: number }> = new Map();
    const monthlyData: { [month: string]: { [subject: string]: { total: number; count: number } } } = {};
    const allSubjects = new Set<string>();
    const last7Days: { [day: string]: number } = {};
    
    for (let i = 6; i >= 0; i--) {
        const day = format(subDays(new Date(), i), 'EEE');
        last7Days[day] = 0;
    }
    const sevenDaysAgo = subDays(new Date(), 7);

    // High-performance single pass loop
    for (const quiz of allQuizzes) {
        if (!quiz.completedAt || !quiz.topic) continue;
        
        const date = quiz.completedAt.toDate();
        const subject = quiz.topic;
        
        // 1. Radar logic
        const currentScore = subjectScores.get(subject) || { total: 0, count: 0 };
        subjectScores.set(subject, { total: currentScore.total + quiz.score, count: currentScore.count + 1 });

        // 2. Line logic
        const month = format(date, 'MMM');
        allSubjects.add(subject);
        if (!monthlyData[month]) monthlyData[month] = {};
        if (!monthlyData[month][subject]) monthlyData[month][subject] = { total: 0, count: 0 };
        monthlyData[month][subject].total += quiz.score;
        monthlyData[month][subject].count += 1;

        // 3. Weekly logic
        if (date > sevenDaysAgo) {
            const dayOfWeek = format(date, 'EEE');
            last7Days[dayOfWeek] = (last7Days[dayOfWeek] || 0) + 15;
        }
    }

    const subjectPerformanceData = Array.from(subjectScores.entries()).map(([subject, stats]) => ({
        subject,
        score: Math.round(stats.total / stats.count),
        fullMark: 100
    }));
    
    const sortedMonths = Object.keys(monthlyData).sort((a,b) => {
        const dateA = new Date(`01 ${a} 2000`);
        const dateB = new Date(`01 ${b} 2000`);
        return dateA.getTime() - dateB.getTime();
    });

    const quizAccuracyData = sortedMonths.map(month => {
        const monthEntry: { name: string; [subject: string]: number | string } = { name: month };
        allSubjects.forEach(subject => {
            if (monthlyData[month][subject]) {
                monthEntry[subject] = Math.round(monthlyData[month][subject].total / monthlyData[month][subject].count);
            }
        });
        return monthEntry;
    });

    const weeklyPerformanceData = Object.entries(last7Days).map(([name, minutes]) => ({ name, minutes }));

    return { subjectPerformanceData, quizAccuracyData, weeklyPerformanceData };
  }, [allQuizzes, isMounted]);

  if (showDiagnostic) {
    return <DiagnosticQuiz onComplete={handleDiagnosticComplete} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}><CardHeader className="pb-2"><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent><Skeleton className="h-6 w-1/4" /><Skeleton className="h-3 w-3/4 mt-1" /></CardContent></Card>
          ))
        ) : (
          statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title} className="h-full transition-shadow duration-300 hover:shadow-lg card-glow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium font-headline">
                      {card.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-xs text-muted-foreground">{card.change}</p>
                  </CardContent>
                </Card>
              );
          })
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
              <CardHeader>
                  <CardTitle className="font-headline">{t('weeklyLearningOverview')}</CardTitle>
                  <CardDescription>{t('weeklyLearningDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
              {isLoading ? (
                  <Skeleton className="w-full h-full" />
              ) : (
                  chartData.weeklyPerformanceData.some(d => d.minutes > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData.weeklyPerformanceData}>
                              <defs>
                                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false}/>
                              <YAxis fontSize={12} tickLine={false} axisLine={false} unit="m" />
                              <Tooltip />
                              <Area isAnimationActive={false} type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" fill="url(#colorMinutes)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  ) : (
                      <EmptyState title="No Activity Yet" description="Complete a session to see progress." ctaText="Take a Quiz" ctaLink="/quiz-generator" />
                  )
              )}
              </CardContent>
          </Card>
          <div className="space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle className="font-headline">{t('levelProgress')}</CardTitle>
                      <CardDescription>{t('levelProgressDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center items-center py-6">
                      {isLoading ? <Skeleton className="w-40 h-40 rounded-full" /> : <ProgressRing />}
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader>
                      <CardTitle className="font-headline">{t('loginStreak')}</CardTitle>
                      <CardDescription>Current streak: {user?.streak ?? 0} days</CardDescription>
                  </CardHeader>
                  <CardContent>
                      {isLoading ? <Skeleton className="w-full h-[100px]" /> : <StreakCalendar />}
                  </CardContent>
              </Card>
          </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
              <CardHeader>
                  <CardTitle className="font-headline">{t('dailyChallenges')}</CardTitle>
                  <CardDescription>{t('dailyChallengesDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                  {isLoading ? <Skeleton className="h-24 w-full" /> : <DailyChallenges />}
              </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle className="font-headline">{t('challengeHistory')}</CardTitle>
                  <CardDescription>{t('challengeHistoryDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                  {isLoading ? <Skeleton className="w-full h-[150px]" /> : <ChallengeHistory />}
              </CardContent>
          </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-1">
              <CardHeader>
                  <CardTitle className="font-headline">{t('subjectPerformance')}</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
              {isLoading ? (
                  <Skeleton className="w-full h-full" />
              ) : (
                  chartData.subjectPerformanceData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={chartData.subjectPerformanceData}>
                              <PolarGrid stroke="hsl(var(--border) / 0.5)" />
                              <PolarAngleAxis dataKey="subject" fontSize={11} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={10} axisLine={false} />
                              <Radar isAnimationActive={false} name="Performance" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                          </RadarChart>
                      </ResponsiveContainer>
                  ) : (
                      <EmptyState title="No Scores Yet" description="Take a quiz to see results." ctaText="Take a Quiz" ctaLink="/quiz-generator" />
                  )
              )}
              </CardContent>
          </Card>
          <Card className="lg:col-span-2">
              <CardHeader>
                  <CardTitle className="font-headline">{t('quizAccuracyTrends')}</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? (
                      <Skeleton className="w-full h-full" />
                ) : (
                      chartData.quizAccuracyData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData.quizAccuracyData}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                                  <XAxis dataKey="name" fontSize={12} />
                                  <YAxis fontSize={12} unit="%" />
                                  <Tooltip />
                                  <Legend iconType="circle" />
                                  {Object.keys(chartData.quizAccuracyData[0] || {}).filter(key => key !== 'name').map((key, i) => (
                                      <Line key={key} isAnimationActive={false} type="monotone" dataKey={key} stroke={`hsl(${(i * 60) % 360}, 70%, 60%)`} strokeWidth={2} dot={{ r: 3 }} />
                                  ))}
                              </LineChart>
                          </ResponsiveContainer>
                      ) : (
                          <EmptyState title="Not Enough Data" description="Trends will appear soon." ctaText="Start a Quiz" ctaLink="/quiz-generator" />
                      )
                )}
              </CardContent>
          </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{t('achievementProgress')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-24 w-full" /> : <AchievementGrid />}
        </CardContent>
      </Card>
    </div>
  )
}
