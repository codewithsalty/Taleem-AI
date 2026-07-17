
'use client';

import { useActionState, useEffect, useState } from 'react';
import UploadForm from '@/components/features/study-suite/upload-form';
import GenerationOptions from '@/components/features/study-suite/generation-options';
import StudySuiteOutputComponent from '@/components/features/study-suite/study-suite-output';
import { generateStudySuiteAction, type StudySuiteFormState, type StudySuiteOutput } from "@/server/actions";
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full font-bold text-lg h-14 cta-gradient text-white shadow-lg hover:shadow-primary/40" disabled={pending}>
      {pending ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
      {pending ? 'Generating...' : 'Generate All Selected'}
    </Button>
  );
}


function OutputPanel({ output }: { output: StudySuiteOutput | undefined }) {
  const { pending } = useFormStatus();
  return <StudySuiteOutputComponent output={output} isLoading={pending} />;
}

export default function StudySuitePage() {
  const initialState: StudySuiteFormState = { message: '', errors: {} };
  const [state, formAction] = useActionState(generateStudySuiteAction, initialState);
  const [output, setOutput] = useState<StudySuiteOutput | undefined>(undefined);

  useEffect(() => {
    // When the server action returns new output, update our stable local state.
    if (state.output) {
      setOutput(state.output);
    }
  }, [state.output]);


  return (
    <div className="container mx-auto p-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Smart Study Suite</h1>
        <p className="text-muted-foreground">
          Upload your study materials to automatically generate quizzes, flashcards, and summaries.
        </p>
      </div>

      <form action={formAction}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 space-y-8">
            <UploadForm state={state} />
            <GenerationOptions />
             <div className="mt-6">
                <SubmitButton />
            </div>
          </div>
          <div className="lg:col-span-2">
            <OutputPanel output={output} />
          </div>
        </div>
      </form>
    </div>
  );
}
