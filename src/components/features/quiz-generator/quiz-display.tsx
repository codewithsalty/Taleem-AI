'use client';

import { useState, useMemo, useEffect } from 'react';
import { type QuizQuestion } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, X, CheckCircle, XCircle, Award, Star } from 'lucide-react';
import Confetti from '@/components/shared/confetti';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import Achievements from '../gamification/achievements';
import { Textarea } from '@/components/ui/textarea';
import { useFirebase, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { doc, increment, collection, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import EmptyState from '@/components/shared/empty-state';


const PointsAnimation = ({ points, onAnimationComplete }: { points: number; onAnimationComplete: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onAnimationComplete, 1500);
        return () => clearTimeout(timer);
    }, [onAnimationComplete]);

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                className="flex flex-col items-center gap-2 p-8 rounded-lg bg-card border shadow-xl"
            >
                <Star className="w-12 h-12 text-yellow-400" fill="currentColor" />
                <p className="text-3xl font-bold text-yellow-400">+{points}</p>
                <p className="text-sm text-muted-foreground">Points Earned!</p>
            </motion.div>
        </div>
    );
};


export default function QuizDisplay({ quiz, topic, questionType, isLoading }: { quiz?: QuizQuestion[], topic?: string, questionType?: string, isLoading?: boolean }) {
  const { firestore, user } = useFirebase();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [showConfetti, setShowConfetti] = useState<Record<number, boolean>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState<number | null>(null);

  const totalQuestions = quiz?.length || 0;
  const progress = totalQuestions > 0 ? ((Object.keys(submitted).length) / totalQuestions) * 100 : 0;
  
  const currentItem = quiz ? quiz[currentQuestionIndex] : null;

  const isMCQ = questionType === 'MCQ' || questionType === 'True/False';

  useEffect(() => {
    // Reset state when a new quiz is loaded
    setSelectedAnswers({});
    setSubmitted({});
    setCurrentQuestionIndex(0);
    setPointsAwarded(null);
  }, [quiz]);

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <div className="flex justify-end pt-4">
                    <Skeleton className="h-10 w-28" />
                </div>
            </CardContent>
        </Card>
    )
  }

  if (!quiz || quiz.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center h-full min-h-[500px] border-dashed">
        <CardContent className="text-center">
            <EmptyState 
                title="Your Quiz Will Appear Here"
                description='Fill out the form and click "Generate Quiz" to see the magic happen.'
                ctaText="Generate Quiz"
                ctaLink="#topic"
            />
        </CardContent>
      </Card>
    );
  }

  const handleSelectAnswer = (questionIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSubmitAnswer = (questionIndex: number) => {
    if (!selectedAnswers[questionIndex]) return;

    setSubmitted(prev => ({
      ...prev,
      [questionIndex]: true,
    }));

    const isCorrect = selectedAnswers[questionIndex].toLowerCase().trim() === quiz[questionIndex].answer.toLowerCase().trim();
    if (isCorrect) {
      setShowConfetti(prev => ({ ...prev, [questionIndex]: true }));
      setTimeout(() => {
        setShowConfetti(prev => ({ ...prev, [questionIndex]: false }));
      }, 2000);
    }
  };

  const handleFinishQuiz = async () => {
    if(user && firestore) {
        const correctAnswers = Object.keys(selectedAnswers).reduce((correctCount, indexStr) => {
            const index = parseInt(indexStr);
            if (selectedAnswers[index].toLowerCase().trim() === quiz[index].answer.toLowerCase().trim()) {
                return correctCount + 1;
            }
            return correctCount;
        }, 0);

        const score = Math.round((correctAnswers / totalQuestions) * 100);
        const isPerfect = score === 100;
        const pointsToAdd = score + (isPerfect ? 25 : 0);
        setPointsAwarded(pointsToAdd);

        const quizHistoryRef = collection(firestore, 'users', user.uid, 'quiz_history');
        const quizResult = {
            topic: topic || 'Custom Quiz',
            score: score,
            status: score >= 80 ? 'Passed' : 'Failed',
            completedAt: serverTimestamp(),
            totalQuestions: totalQuestions,
            correctAnswers: correctAnswers,
        };

        // Use non-blocking helper for the mutations
        addDocumentNonBlocking(quizHistoryRef, quizResult);
        updateDocumentNonBlocking(doc(firestore, 'users', user.uid), { points: increment(pointsToAdd) });

    } else {
        // Fallback for non-logged-in users
        setShowAchievement(true);
        setTimeout(() => setShowAchievement(false), 4000);
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
    } else {
        handleFinishQuiz();
    }
  }
  
  const getOptionClass = (questionIndex: number, option: string) => {
    if (!submitted[questionIndex]) {
        const isSelected = option === selectedAnswers[questionIndex];
        return isSelected ? 'bg-primary/20 border-primary shadow-lg' : 'bg-muted/30 hover:bg-muted/70 hover:glow-effect';
    }
    
    const question = quiz[questionIndex];
    const isSelected = option === selectedAnswers[questionIndex];
    const isCorrect = option === question.answer;

    if (isCorrect) return 'bg-green-500/20 border-green-500 shadow-lg shadow-green-500/10';
    if (isSelected && !isCorrect) return 'bg-red-500/20 border-red-500 shadow-lg shadow-red-500/10';
    return 'bg-muted/30 opacity-60';
  };

  const getOptionIcon = (questionIndex: number, option: string) => {
    if (!submitted[questionIndex]) return null;
    const question = quiz[questionIndex];
    const isCorrect = option === question.answer;
    
    if (isCorrect) return <CheckCircle className="ml-auto h-6 w-6 text-green-500" />;
    if (option === selectedAnswers[questionIndex] && !isCorrect) return <XCircle className="ml-auto h-6 w-6 text-red-500" />;

    return null;
  }

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="relative">
      {showAchievement && <Achievements badgeName="First Quiz!" badgeIcon={<Award className="w-16 h-16" />} />}
      {pointsAwarded !== null && <PointsAnimation points={pointsAwarded} onAnimationComplete={() => {
          setPointsAwarded(null);
          // Only show achievement on the first quiz
          if (user?.points === 0) {
            setShowAchievement(true);
            setTimeout(() => setShowAchievement(false), 4000);
          }
      }} />}
      
      <div className="sticky top-0 bg-background/90 backdrop-blur-sm z-10 py-4 px-2">
        <p className="text-sm text-muted-foreground mb-2">Progress</p>
        <Progress value={progress} className="h-2" />
      </div>
        
      {currentItem && (
        <Card key={currentQuestionIndex} className="gradient-border-card shadow-2xl shadow-primary/10 animate-slide-in flex flex-col mt-4 min-h-[500px]">
          {showConfetti[currentQuestionIndex] && <Confetti />}
          <CardHeader>
              <div className="flex items-center justify-between">
                  <CardDescription>Question {currentQuestionIndex + 1} of {totalQuestions}</CardDescription>
                  {/* Placeholder for timer */}
              </div>
              <CardTitle className="text-xl md:text-2xl pt-4 font-headline break-words">{currentItem.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow">
              {isMCQ ? (
                  currentItem.options?.map((option, optionIndex) => (
                      <Button 
                          key={optionIndex}
                          variant="outline"
                          className={cn(
                              "w-full justify-start h-auto min-h-14 py-4 px-4 text-left text-base rounded-lg transition-all duration-300 ease-in-out transform text-wrap",
                              "active:scale-95",
                              getOptionClass(currentQuestionIndex, option)
                          )}
                          onClick={() => !submitted[currentQuestionIndex] && handleSelectAnswer(currentQuestionIndex, option)}
                          disabled={submitted[currentQuestionIndex]}
                      >
                          <div className="flex items-center w-full gap-4">
                              <div className="flex items-center justify-center h-8 w-8 rounded-md bg-background border text-muted-foreground font-bold shrink-0">
                                  {optionLetters[optionIndex]}
                              </div>
                              <span className="flex-grow w-0">{option}</span>
                              {getOptionIcon(currentQuestionIndex, option)}
                          </div>
                      </Button>
                  ))
              ) : (
                  <div className="py-4">
                      <Textarea
                          placeholder="Type your answer here..."
                          className="min-h-[150px] text-base"
                          value={selectedAnswers[currentQuestionIndex] || ''}
                          onChange={(e) => handleSelectAnswer(currentQuestionIndex, e.target.value)}
                          disabled={!!submitted[currentQuestionIndex]}
                      />
                       {submitted[currentQuestionIndex] && (
                          <div className="mt-4 p-4 bg-muted rounded-lg">
                              <h4 className="font-semibold text-sm text-primary">Correct Answer</h4>
                              <p className="text-base mt-1">{currentItem.answer}</p>
                          </div>
                      )}
                  </div>
              )}
          </CardContent>
          <div className="p-6 pt-2 flex justify-end items-center gap-4">
              {submitted[currentQuestionIndex] && (
                  <div className={cn(
                      "font-bold text-lg",
                      selectedAnswers[currentQuestionIndex]?.toLowerCase().trim() === currentItem.answer.toLowerCase().trim() ? "text-green-400" : "text-red-400"
                  )}>
                      {selectedAnswers[currentQuestionIndex]?.toLowerCase().trim() === currentItem.answer.toLowerCase().trim() ? "Correct!" : "Incorrect!"}
                  </div>
              )}

              {!submitted[currentQuestionIndex] ? (
                  <Button size="lg" onClick={() => handleSubmitAnswer(currentQuestionIndex)} disabled={!selectedAnswers[currentQuestionIndex]}>
                      Check
                  </Button>
              ) : (
                  <Button size="lg" onClick={handleNextQuestion}>
                      {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
                  </Button>
              )}
          </div>
        </Card>
      )}
    </div>
  );
}