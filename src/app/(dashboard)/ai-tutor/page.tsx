
'use client';

import { useState, useEffect, useActionState } from 'react';
import AiTutor from '@/components/features/ai-tutor/ai-tutor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { generateTutorContextAction, type TutorContextFormState } from "@/server/actions";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useUser } from '@/firebase';


function UploadSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" type="submit" disabled={pending}>
       {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Processing...' : 'Use This Material'}
    </Button>
  );
}

export default function AiTutorPage() {
  const { user } = useUser();
  const [fileName, setFileName] = useState('');
  const [documentText, setDocumentText] = useState<string | null>(null);
  const { toast } = useToast();

  const initialState: TutorContextFormState = { message: '' };
  const [state, formAction] = useActionState(generateTutorContextAction, initialState);
  
  useEffect(() => {
    if (state.documentText) {
        setDocumentText(state.documentText);
        toast({
            title: 'Material Ready',
            description: "You can now ask questions about the provided content.",
        });
    } else if (state.message && state.message.toLowerCase().includes('fail')) {
         toast({
            title: 'Processing Failed',
            description: state.message || 'An error occurred while processing the document.',
            variant: 'destructive',
        });
    }
  }, [state, toast]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : '');
  };

  const handleStartOver = () => {
    setDocumentText(null);
    setFileName('');
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2">Rag Based Ai Tutor</h1>
        <p className="text-muted-foreground mb-6">
          {documentText === null 
            ? "Upload your learning material, and our AI will use it as a knowledge base to answer your questions with curriculum-grounded responses."
            : "Ask questions about the material you uploaded."
          }
        </p>
      </div>

      {documentText === null ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Upload className="w-5 h-5" />
              Upload Learning Material
            </CardTitle>
            <CardDescription>
              Upload a document or paste text. The tutor will use this as context for your chat.
            </CardDescription>
          </CardHeader>
          <form action={formAction}>
            {user?.uid && <input type="hidden" name="userId" value={user.uid} />}
            <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label>Paste Text</Label>
                  <Textarea name="text" placeholder="Paste your text content here..." className="h-28" />
              </div>
              <div className="text-center text-muted-foreground text-sm">OR</div>
              <div className="space-y-2">
                  <Label>Upload File</Label>
                  <div className="flex items-center justify-center w-full">
                      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <FileText className="w-8 h-8 mb-4 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                          </div>
                          <Input id="dropzone-file" name="file" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.txt,.md" />
                      </label>
                  </div>
                   {fileName && (
                    <div className="mt-4 text-sm text-muted-foreground">
                      Selected file: <span className="font-medium text-foreground">{fileName}</span>
                    </div>
                  )}
              </div>
               {state.errors?.text && (
                <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Input Required</AlertTitle>
                    <AlertDescription>{state.errors.text[0]}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <UploadSubmitButton />
                 <Button variant="link" type="button" onClick={() => setDocumentText('')}>Skip and use general knowledge</Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <>
            <Alert variant="default" className="bg-green-500/10 border-green-500/50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-400">Material Ready</AlertTitle>
                <AlertDescription className="text-green-400/80">
                    The tutor will now use your document to answer questions.
                    <Button variant="link" onClick={handleStartOver} className="p-0 ml-2 h-auto text-green-300">Upload new material</Button>
                </AlertDescription>
            </Alert>
            <AiTutor documentText={documentText} />
        </>
      )}
    </div>
  );
}
