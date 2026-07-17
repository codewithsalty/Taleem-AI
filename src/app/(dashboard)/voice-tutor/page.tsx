
'use client';

import { useState } from 'react';
import VoiceTutor from '@/components/features/voice-tutor/voice-tutor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export default function VoiceTutorPage() {
    const [documentText, setDocumentText] = useState<string | null>(null);

    const handleStartWithGeneralKnowledge = () => {
        setDocumentText(''); // Empty string signifies general knowledge mode
    };

    return (
        <>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline mb-2">Voice Based Rag Tutor</h1>
                    <p className="text-muted-foreground">
                        The most natural way to learn. Push the button to talk, and get a spoken response. Currently, the latency is high as it is an MVP, and we will soon work on it to reduce it and introduce proper voice streaming.
                    </p>
                </div>
                
                {documentText === null ? (
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline">
                                <Upload className="w-5 h-5" />
                                Let's Get Started
                            </CardTitle>
                            <CardDescription>
                                To talk about a specific document, paste the content below. Otherwise, you can use the tutor with general knowledge.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <textarea
                                id="document-text-area"
                                placeholder="Optional: Paste text from your study material here to ask questions about it."
                                className="w-full h-40 p-2 border rounded-md bg-muted/50"
                            />
                        </CardContent>
                        <CardFooter className="flex-col gap-4">
                            <Button className="w-full" onClick={() => {
                                const text = (document.getElementById('document-text-area') as HTMLTextAreaElement).value;
                                setDocumentText(text);
                            }}>
                                Use Pasted Text
                            </Button>
                            <Button variant="link" onClick={handleStartWithGeneralKnowledge}>
                                Or, use general knowledge
                            </Button>
                        </CardFooter>
                    </Card>
                ) : (
                    <VoiceTutor documentText={documentText} />
                )}
            </div>
        </>
    );
}
