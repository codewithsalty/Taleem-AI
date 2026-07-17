
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Youtube, Sparkles, AlertCircle } from 'lucide-react';
import { generateYoutubeSummaryAction, type YoutubeSummarizerFormState } from "@/server/actions";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

function SubmitButton({ onSubmit }: { onSubmit: () => void }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full font-bold" onClick={onSubmit}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      {pending ? 'Summarizing...' : 'Generate Summary'}
    </Button>
  );
}

function SummaryDisplay({ summary, isLoading }: { summary?: string, isLoading: boolean }) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </div>
        )
    }

    if (!summary) {
        return (
            <div className="text-center text-muted-foreground py-8">
                <p>Your video summary will appear here.</p>
            </div>
        )
    }

    return (
        <div className="prose dark:prose-invert max-w-none">
            {summary.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
            ))}
        </div>
    )
}

function SummaryPanel({ summary }: { summary?: string }) {
  const { pending } = useFormStatus();
  return <SummaryDisplay summary={summary} isLoading={pending} />;
}

export default function YoutubeSummarizerPage() {
  const initialState: YoutubeSummarizerFormState = { message: '', errors: {} };
  const [state, formAction] = useActionState(generateYoutubeSummaryAction, initialState);
  const [hasAttempted, setHasAttempted] = useState(false);

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-2">YouTube Video Summarizer</h1>
      <p className="text-muted-foreground mb-6">
        Paste a YouTube video link to get a concise summary of its content.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <form action={formAction}>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Youtube className="w-6 h-6 text-red-500" />
                Video Link
              </CardTitle>
              <CardDescription>Enter the URL of the YouTube video you want to summarize.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">YouTube URL</Label>
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  placeholder="https://www.youtube.com/watch?v=..."
                  type="url"
                />
              </div>
              {hasAttempted && state.errors?.videoUrl && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Invalid URL</AlertTitle>
                  <AlertDescription>{state.errors.videoUrl[0]}</AlertDescription>
                </Alert>
              )}
              {hasAttempted && state.message && !state.summary && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Summarization Failed</AlertTitle>
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <SubmitButton onSubmit={() => setHasAttempted(true)} />
            </CardFooter>
          </Card>
        </form>

        <Card>
           <CardHeader>
                <CardTitle className="font-headline">Summary</CardTitle>
                <CardDescription>A brief overview of the video's key points.</CardDescription>
            </CardHeader>
            <CardContent>
               <SummaryPanel summary={state.summary} />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
