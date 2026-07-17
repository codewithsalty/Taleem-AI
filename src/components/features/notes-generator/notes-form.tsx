
'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { type NotesFormState } from "@/server/actions";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, FileText, NotebookPen, Image, Map } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full font-bold">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <NotebookPen className="mr-2 h-4 w-4" />}
      {pending ? 'Generating...' : 'Generate Notes'}
    </Button>
  );
}

export default function NotesForm({ state }: { state: NotesFormState }) {
  const [fileName, setFileName] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : '');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Notes Content</CardTitle>
        <CardDescription>Provide your material and select generation options.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="notes-content">Paste Your Notes</Label>
          <Textarea
            id="notes-content"
            name="text"
            placeholder="Paste your notes here..."
            className="min-h-[150px]"
          />
        </div>

        <div className="text-center text-muted-foreground text-sm">OR</div>
        
        <div className="grid gap-2">
            <Label>Upload File</Label>
            <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileText className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PDF, DOCX, TXT, MD</p>
                    </div>
                    <Input id="dropzone-file" name="file" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt,.md" />
                </label>
            </div>
             {fileName && (
              <div className="mt-2 text-sm text-muted-foreground">
                Selected file: <span className="font-medium text-foreground">{fileName}</span>
              </div>
            )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="prompt">Guiding Prompt (Optional)</Label>
          <Input id="prompt" name="prompt" placeholder="e.g., 'Focus on the main themes and key figures'" />
        </div>
        
        <div className="space-y-2">
            <Label>Enhancements</Label>
             <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary/50">
                <Checkbox id="includeDiagram" name="includeDiagram" defaultChecked />
                <Label htmlFor="includeDiagram" className="flex items-center gap-2 cursor-pointer">
                    <Image className="w-5 h-5 text-primary" />
                    <span>Include AI Diagram</span>
                </Label>
            </div>
             <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary/50">
                <Checkbox id="includeConceptMap" name="includeConceptMap" defaultChecked/>
                <Label htmlFor="includeConceptMap" className="flex items-center gap-2 cursor-pointer">
                    <Map className="w-5 h-5 text-primary" />
                    <span>Include Concept Map</span>
                </Label>
            </div>
             <div className="flex items-center justify-between rounded-lg border p-3">
                <Label>Language Preference</Label>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="lang-en">EN</Label>
                    <Switch id="lang-toggle" name="language" />
                    <Label htmlFor="lang-ur">UR</Label>
                </div>
            </div>
        </div>

        {state.errors?.text && (
            <p className="text-sm text-destructive">{state.errors.text[0]}</p>
        )}
        
        {state.message && !state.notes && (
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
