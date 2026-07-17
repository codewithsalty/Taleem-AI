
'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateFlashcardsAction, type FlashcardFormState } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import FlashcardDisplay from './flashcard-display';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full font-bold">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? 'Generating...' : 'Generate Flashcards'}
    </Button>
  );
}

const sampleNotes = `Photosynthesis is the process used by plants, algae, and certain bacteria to convert light energy into chemical energy.
Key Inputs: Carbon Dioxide (CO2), Water (H2O), and Sunlight.
Key Outputs: Glucose (C6H12O6) and Oxygen (O2).
The process occurs in the chloroplasts, which contain the pigment chlorophyll.
There are two main stages: the light-dependent reactions and the light-independent reactions (Calvin Cycle).
The light-dependent reactions capture light energy to make ATP and NADPH.
The Calvin Cycle uses ATP and NADPH to convert CO2 into glucose.`;

function FormContent({ state }: { state: FlashcardFormState }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Flashcard Content</CardTitle>
        <CardDescription>Paste the text you want to learn.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="text">Your Notes</Label>
          <Textarea
            id="text"
            name="text"
            placeholder="Paste your notes here... The AI will extract key concepts and create flashcards."
            className="min-h-[250px]"
            defaultValue={sampleNotes}
          />
          {state.errors?.text && (
            <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Input Required</AlertTitle>
                <AlertDescription>{state.errors.text[0]}</AlertDescription>
            </Alert>
          )}
        </div>
        {state.message && !state.flashcards && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
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

export default function FlashcardForm() {
  const initialState: FlashcardFormState = { message: '', errors: {} };
  const [state, setState] = useState(initialState);
  const { pending } = useFormStatus();

  const handleFormAction = async (formData: FormData) => {
    const newState = await generateFlashcardsAction(state, formData);
    setState(newState);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <form action={handleFormAction}>
          <FormContent state={state} />
        </form>
      </div>
      <div className="lg:col-span-2">
        <FlashcardDisplay flashcards={state.flashcards} isLoading={pending} />
      </div>
    </div>
  );
}
