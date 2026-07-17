
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';
import { useFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

const questions = [
  {
    question: "Which of these is a prime number?",
    options: ["4", "9", "7", "12"],
    answer: "7",
  },
  {
    question: "What is the capital of Pakistan?",
    options: ["Karachi", "Lahore", "Islamabad", "Peshawar"],
    answer: "Islamabad",
  },
  {
    question: "Which process do plants use to make food?",
    options: ["Respiration", "Photosynthesis", "Transpiration", "Decomposition"],
    answer: "Photosynthesis",
  },
  {
    question: "Who wrote the national anthem of Pakistan?",
    options: ["Allama Iqbal", "Hafeez Jalandhari", "Faiz Ahmed Faiz", "Mirza Ghalib"],
    answer: "Hafeez Jalandhari",
  },
  {
    question: "What is H₂O commonly known as?",
    options: ["Salt", "Sugar", "Water", "Oxygen"],
    answer: "Water",
  },
];

type DiagnosticQuizProps = {
  onComplete: () => void;
};

export default function DiagnosticQuiz({ onComplete }: DiagnosticQuizProps) {
  const { firestore, user } = useFirebase();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectAnswer = (option: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: option,
    }));
    
    // Automatically move to the next question
    setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleFinishQuiz();
        }
    }, 300);
  };

  const handleFinishQuiz = async () => {
    setIsLoading(true);
    let correctAnswers = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) {
        correctAnswers++;
      }
    });

    const pointsAwarded = correctAnswers * 10;
    
    if (user && firestore) {
        const userRef = doc(firestore, 'users', user.uid);
        updateDocumentNonBlocking(userRef, { points: pointsAwarded });
    }

    setIsFinished(true);

    setTimeout(() => {
        setIsLoading(false);
        onComplete();
    }, 2000);
  };
  
  if (isFinished) {
    return (
        <div className="flex justify-center items-center h-full py-16">
            <Card className="w-full max-w-lg text-center p-8">
                <CardTitle className="text-3xl font-headline">Welcome to Taleem AI!</CardTitle>
                <CardDescription className="mt-2 text-lg">You're all set. Let your learning journey begin!</CardDescription>
                <div className="mt-6">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary"/>
                    <p className="mt-4 text-muted-foreground">Redirecting to your dashboard...</p>
                </div>
            </Card>
        </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex justify-center items-center h-full py-16">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Let's Get Started</CardTitle>
          <CardDescription>Answer a few quick questions to set up your profile.</CardDescription>
          <div className="pt-4">
            <div className="relative h-2 rounded-full bg-muted">
                <div className="absolute top-0 left-0 h-2 rounded-full bg-primary transition-all duration-300" style={{width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`}}></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option) => (
              <Button
                key={option}
                variant={selectedAnswers[currentQuestionIndex] === option ? 'default' : 'outline'}
                className="h-auto py-4 text-base justify-start"
                onClick={() => handleSelectAnswer(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
