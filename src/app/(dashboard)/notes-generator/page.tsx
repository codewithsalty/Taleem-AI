
'use client';

import { useActionState } from 'react';
import NotesForm from '@/components/features/notes-generator/notes-form';
import NotesDisplay from '@/components/features/notes-generator/notes-display';
import { generateNotesAction, type NotesFormState } from "@/server/actions";

export default function NotesGeneratorPage() {
  const initialState: NotesFormState = { message: '', errors: {} };
  const [state, formAction] = useActionState(generateNotesAction, initialState);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2">AI Notes Generator</h1>
        <p className="text-muted-foreground">
          Upload or paste your study material to generate clear, structured notes in seconds.
        </p>
      </div>
      <form action={formAction}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <NotesForm state={state} />
          </div>
          <div className="lg:col-span-2">
            {/* The loading state will be derived inside NotesDisplay or passed from a component within the form */}
            <NotesDisplay state={state} />
          </div>
        </div>
      </form>
    </div>
  );
}
