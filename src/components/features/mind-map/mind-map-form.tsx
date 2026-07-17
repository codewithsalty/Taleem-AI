
'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateMindMapAction, type MindMapFormState } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import MindMapDisplay from './mind-map-display';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, Map } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full font-bold">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Map className="mr-2 h-4 w-4" />}
      {pending ? 'Generating...' : 'Generate Mind Map'}
    </Button>
  );
}

function FormContent({ state }: { state: MindMapFormState }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Mind Map Content</CardTitle>
        <CardDescription>Paste the text you want to visualize.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="text">Your Notes</Label>
          <Textarea
            id="text"
            name="text"
            placeholder="Paste your notes here... The AI will analyze the text and create a concept map."
            className="min-h-[350px]"
          />
          {state.errors?.text && (
            <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Input Required</AlertTitle>
                <AlertDescription>{state.errors.text[0]}</AlertDescription>
            </Alert>
          )}
        </div>
        {state.message && !state.mermaidGraph && (
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

export default function MindMapForm() {
  const initialState: MindMapFormState = { message: '', errors: {} };
  const [state, setState] = useState(initialState);
  const { pending } = useFormStatus();

  const handleFormAction = async (formData: FormData) => {
    const newState = await generateMindMapAction(state, formData);
    setState(newState);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <form action={handleFormAction}>
        <FormContent state={state} />
      </form>
      <div>
        <MindMapDisplay mermaidGraph={state.mermaidGraph} isLoading={pending} />
      </div>
    </div>
  );
}
