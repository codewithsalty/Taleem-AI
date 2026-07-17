

'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreVertical, Loader2 } from "lucide-react"
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, limit, orderBy } from 'firebase/firestore';
import { type QuizResult } from '@/lib/types';
import EmptyState from '@/components/shared/empty-state';

export default function RecentQuizzes() {
    const { firestore, user } = useFirebase();

    const quizHistoryQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'users', user.uid, 'quiz_history'), orderBy('completedAt', 'desc'), limit(5));
    }, [firestore, user]);

    const { data: recentQuizzes, isLoading } = useCollection<QuizResult>(quizHistoryQuery);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Recent Quizzes</CardTitle>
                <CardDescription>A history of quizzes you've recently taken.</CardDescription>
            </CardHeader>
            <CardContent>
                 {isLoading && (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                {!isLoading && (!recentQuizzes || recentQuizzes.length === 0) && (
                    <EmptyState 
                        title="No Quizzes Taken Yet"
                        description="Your recent quiz history will appear here once you complete a quiz."
                        ctaText="Take a Quiz"
                        ctaLink="/quiz-generator"
                    />
                )}
                {!isLoading && recentQuizzes && recentQuizzes.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Topic</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Score</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentQuizzes.map((quiz) => (
                            <TableRow key={quiz.id}>
                                <TableCell className="font-medium">{quiz.topic}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={quiz.status === "Passed" ? "success" : "destructive"}>
                                        {quiz.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center font-semibold">{quiz.score}%</TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                    {quiz.completedAt ? new Date(quiz.completedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" aria-label={`Actions for quiz on ${quiz.topic}`}>
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
