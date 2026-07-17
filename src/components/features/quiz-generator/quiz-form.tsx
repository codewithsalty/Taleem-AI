

'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateQuizAction, type QuizFormState } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import QuizDisplay from './quiz-display';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full font-bold">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? 'Generating...' : 'Generate Quiz'}
    </Button>
  );
}

function FormContent({ state, setQuestionCount, questionCount }: { state: QuizFormState, setQuestionCount: (value: number) => void, questionCount: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Quiz Settings</CardTitle>
        <CardDescription>Define the parameters for your new quiz.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="topic">Topic</Label>
          <Input id="topic" name="topic" placeholder="e.g., The Renaissance" />
          {state.errors?.topic && <p className="text-sm text-destructive mt-2">{state.errors.topic[0]}</p>}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select name="difficulty" defaultValue="Intermediate">
                    <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                </Select>
                 {state.errors?.difficulty && <p className="text-sm text-destructive">{state.errors.difficulty[0]}</p>}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="questionType">Question Type</Label>
                <Select name="questionType" defaultValue="MCQ">
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="MCQ">Multiple Choice</SelectItem>
                        <SelectItem value="True/False">True/False</SelectItem>
                        <SelectItem value="Short Answer">Short Answer</SelectItem>
                        <SelectItem value="Essay">Essay</SelectItem>
                    </SelectContent>
                </Select>
                 {state.errors?.questionType && <p className="text-sm text-destructive">{state.errors.questionType[0]}</p>}
            </div>
        </div>

        <div className="grid gap-2">
            <Label htmlFor="questionCount">Number of Questions: {questionCount}</Label>
            <input type="hidden" name="questionCount" value={questionCount} />
            <Slider 
                defaultValue={[10]} 
                max={20} 
                min={5}
                step={1} 
                onValueChange={(value) => setQuestionCount(value[0])}
            />
             {state.errors?.questionCount && <p className="text-sm text-destructive mt-2">{state.errors.questionCount[0]}</p>}
        </div>
        {state.message && !state.quiz && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Quiz Generation Failed</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
            </Alert>
        )}
      </CardContent>
      <CardFooter>
        <SubmitButton />
      </CardFooter>
    </Card>
  );
}


export default function QuizForm() {
  const initialState: QuizFormState = { message: '', errors: {} };
  const [state, setState] = useState(initialState);
  const [questionCount, setQuestionCount] = useState(10);
  const [questionType, setQuestionType] = useState('MCQ');
  
  const { pending } = useFormStatus();

  const handleFormAction = async (formData: FormData) => {
    setQuestionType(formData.get('questionType') as string);
    const newState = await generateQuizAction(state, formData);
    setState(newState);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
        <form action={handleFormAction}>
          <FormContent state={state} questionCount={questionCount} setQuestionCount={setQuestionCount}/>
        </form>
      <div>
        <QuizDisplay quiz={state.quiz} topic={state.topic} questionType={questionType} isLoading={pending} />
      </div>
    </div>
  );
}
