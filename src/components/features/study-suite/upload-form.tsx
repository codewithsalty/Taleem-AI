
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { StudySuiteFormState } from '@/lib/actions';

export default function UploadForm({ state }: { state: StudySuiteFormState }) {
    const [fileName, setFileName] = useState('');
    const [pageCount, setPageCount] = useState(0);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            // In a real app, you'd use a library like pdf-lib to get page count
            setPageCount(Math.ceil(Math.random() * 50)); 
        } else {
            setFileName('');
            setPageCount(0);
        }
    };
    
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Upload className="w-5 h-5" />
          Upload Content
        </CardTitle>
        <CardDescription>
            Provide your study material and some basic information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <div 
                className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted animate-border-pulse"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    const input = document.getElementById('dropzone-file') as HTMLInputElement;
                    if (e.dataTransfer.files.length > 0) {
                        input.files = e.dataTransfer.files;
                        const changeEvent = new Event('change', { bubbles: true });
                        input.dispatchEvent(changeEvent);
                    }
                }}
            >
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-full">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileText className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-center text-muted-foreground"><span className="font-semibold">Click or drag file</span></p>
                    </div>
                    <Input id="dropzone-file" name="file" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
                </label>
            </div>

            {fileName && (
              <div className="mt-4 text-sm text-muted-foreground border p-3 rounded-md">
                <p className="font-medium text-foreground truncate">{fileName}</p>
                <p className="text-xs">{pageCount} pages</p>
              </div>
            )}
        </div>

        <div className="space-y-2">
            <Label>Or Paste Text</Label>
            <Textarea name="text" placeholder="Paste your text content here..." className="h-28" />
             {state.errors?.text && (
                <p className="text-sm text-destructive mt-2">{state.errors.text[0]}</p>
             )}
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select name="subject">
                <SelectTrigger id="subject">
                    <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="math">Math</SelectItem>
                    <SelectItem value="urdu">Urdu</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="pakistan-studies">Pakistan Studies</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                 <Select name="grade">
                <SelectTrigger id="grade">
                    <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                    {Array.from({length: 8}, (_, i) => i + 1).map(g => (
                        <SelectItem key={g} value={String(g)}>Grade {g}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="chapter">Chapter Name</Label>
            <Input id="chapter" name="chapter" placeholder="e.g., Introduction to Algebra" />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
                <Label>Language Preference</Label>
                <CardDescription>Generate content in both languages.</CardDescription>
            </div>
             <div className="flex items-center space-x-2">
                <Label htmlFor="lang-en">EN</Label>
                <Switch id="lang-toggle" name="language" />
                <Label htmlFor="lang-ur">UR</Label>
            </div>
        </div>
         {state.message && !state.output && !state.errors?.text &&(
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
