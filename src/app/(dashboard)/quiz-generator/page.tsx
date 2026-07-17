import QuizForm from '@/components/features/quiz-generator/quiz-form';
import PerformanceStats from '@/components/features/quiz-generator/performance-stats';
import RecentQuizzes from '@/components/features/quiz-generator/recent-quizzes';

export default function QuizGeneratorPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2">AI Quiz Generator</h1>
        <p className="text-muted-foreground">
          Create a custom quiz on any topic in seconds. Let our AI do the hard work for you.
        </p>
      </div>
      <QuizForm />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3">
            <PerformanceStats />
        </div>
        <div className="lg:col-span-3">
            <RecentQuizzes />
        </div>
      </div>
    </div>
  );
}
