

'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Target, TrendingUp, BookOpen } from "lucide-react"
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, limit, orderBy } from 'firebase/firestore';
import { type QuizResult } from '@/lib/types';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PerformanceStats() {
    const { firestore, user } = useFirebase();

    const quizHistoryQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'users', user.uid, 'quiz_history'), orderBy('completedAt', 'desc'));
    }, [firestore, user]);

    const { data: quizHistory, isLoading } = useCollection<QuizResult>(quizHistoryQuery);

    const performanceData = useMemo(() => {
        if (!quizHistory || quizHistory.length === 0) {
            return {
                averageScore: 0,
                quizzesPassed: 0,
                totalQuizzes: 0,
                bestSubject: "N/A",
            };
        }

        const totalScore = quizHistory.reduce((acc, quiz) => acc + quiz.score, 0);
        const averageScore = Math.round(totalScore / quizHistory.length);
        const quizzesPassed = quizHistory.filter(q => q.status === 'Passed').length;

        const subjectScores: { [subject: string]: { total: number, count: number } } = {};
        quizHistory.forEach(quiz => {
            const subject = quiz.topic; // Assuming topic is the subject for now
            if (!subjectScores[subject]) {
                subjectScores[subject] = { total: 0, count: 0 };
            }
            subjectScores[subject].total += quiz.score;
            subjectScores[subject].count += 1;
        });

        let bestSubject = "N/A";
        let bestAvg = 0;
        for (const subject in subjectScores) {
            const avg = subjectScores[subject].total / subjectScores[subject].count;
            if (avg > bestAvg) {
                bestAvg = avg;
                bestSubject = subject;
            }
        }

        return {
            averageScore,
            quizzesPassed,
            totalQuizzes: quizHistory.length,
            bestSubject,
            bestSubjectScore: Math.round(bestAvg),
        };
    }, [quizHistory]);

    const stats = [
        {
            title: "Average Score",
            value: `${performanceData.averageScore}%`,
            icon: <TrendingUp className="h-6 w-6 text-primary" />,
            description: "Your average across all quizzes"
        },
        {
            title: "Quizzes Passed",
            value: `${performanceData.quizzesPassed} / ${performanceData.totalQuizzes}`,
            icon: <Target className="h-6 w-6 text-secondary" />,
            description: `${performanceData.totalQuizzes > 0 ? Math.round((performanceData.quizzesPassed / performanceData.totalQuizzes) * 100) : 0}% pass rate`
        },
        {
            title: "Best Subject",
            value: performanceData.bestSubject,
            icon: <Award className="h-6 w-6 text-accent" />,
            description: performanceData.bestSubject !== "N/A" ? `${performanceData.bestSubjectScore}% average score` : 'Take a quiz to find out!'
        }
    ]
    
    if (isLoading) {
        return (
             <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
        )
    }

    return (
        <div>
            <h2 className="text-2xl font-bold font-headline mb-4">Your Quiz Performance</h2>
            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            {stat.icon}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
