
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Loader2, Upload, AlertCircle, Sparkles } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { generatePresentationAction, type PresentationFormState } from '@/lib/actions';
import PresentationDisplay from '@/components/features/presentation-maker/presentation-display';

function SubmitButton({ onSubmit }: { onSubmit: () => void }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full font-bold" onClick={onSubmit}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      {pending ? 'Generating...' : 'Generate Presentation'}
    </Button>
  );
}

function IsLoadingWrapper({ presentation, children }: { presentation: any; children: (pending: boolean) => React.ReactNode }) {
  const { pending } = useFormStatus();
  return <>{children(pending)}</>;
}

export default function PresentationMakerPage() {
    const initialState: PresentationFormState = { message: '', errors: {} };
    const [state, formAction] = useActionState(generatePresentationAction, initialState);
    const [hasAttempted, setHasAttempted] = useState(false);

    const [fileName, setFileName] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setFileName(file ? file.name : '');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold font-headline mb-2">AI Presentation Maker</h1>
            <p className="text-muted-foreground mb-6">
                Just enter a topic and the AI builds a full slide deck — or paste your own notes for a personalized presentation.
            </p>
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <form action={formAction}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Presentation Content</CardTitle>
                                <CardDescription>Provide material for the AI to work with.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="topic">Topic <span className="text-xs text-primary font-medium">(AI generates full content from this)</span></Label>
                                    <Input id="topic" name="topic" placeholder="e.g., The Future of Renewable Energy" />
                                    <p className="text-xs text-muted-foreground">Just a topic is enough — AI will research and create all slides automatically.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="text">Paste Your Own Text <span className="text-xs text-muted-foreground">(optional)</span></Label>
                                    <Textarea id="text" name="text" placeholder="Or paste notes/content to base the slides on..." className="h-28" />
                                </div>
                                <div className="text-center text-muted-foreground text-sm">OR</div>
                                <div className="space-y-2">
                                    <Label>Upload File</Label>
                                    <div className="flex items-center justify-center w-full">
                                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drop</p>
                                            </div>
                                            <Input id="dropzone-file" name="file" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.txt,.md,.docx" />
                                        </label>
                                    </div>
                                    {fileName && (
                                        <div className="mt-2 text-sm text-muted-foreground">
                                            Selected file: <span className="font-medium text-foreground">{fileName}</span>
                                        </div>
                                    )}
                                </div>
                                {/* Only show errors AFTER the user has attempted to submit */}
                                {hasAttempted && (state.errors?.text || state.errors?.topic) && (
                                    <Alert variant="destructive" className="mt-4">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Input Required</AlertTitle>
                                        <AlertDescription>{state.errors.text?.[0] || state.errors.topic?.[0]}</AlertDescription>
                                    </Alert>
                                )}
                                {hasAttempted && state.message && !state.presentation && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{state.message}</AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                            <CardFooter>
                                <SubmitButton onSubmit={() => setHasAttempted(true)} />
                            </CardFooter>
                        </Card>
                    </form>
                </div>
                <div className="lg:col-span-2">
                    <IsLoadingWrapper presentation={state.presentation}>
                        {(pending) => (
                            <PresentationDisplay presentation={state.presentation} isLoading={pending} />
                        )}
                    </IsLoadingWrapper>
                </div>
            </div>
        </div>
    );
}
