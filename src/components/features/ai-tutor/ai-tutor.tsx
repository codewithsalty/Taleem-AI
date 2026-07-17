'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, Loader2, Send, User, AlertCircle, Mic, Volume2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { type Message } from '@/lib/types';
import { generateTutorResponseAction, generateVoiceTutorResponseAction } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

const initialMessages: Message[] = [
    { role: 'assistant', content: "Hello! I am ready to answer questions about your document." }
];

type AiTutorProps = {
    documentText: string;
};

function useSpeechRecognition(onResult: (text: string) => void) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
        };

        recognition.onerror = () => {
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    return { isListening, startListening, stopListening };
}

export default function AiTutor({ documentText }: AiTutorProps) {
    const { user } = useUser();
    const userId = user?.uid;
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [currentMessage, setCurrentMessage] = useState('');
    const viewportRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);
        setCurrentMessage('');

        const formData = new FormData();
        formData.append('userMessage', text);
        formData.append('documentText', documentText);
        if (userId) {
            formData.append('userId', userId);
        }

        try {
            const result = await generateTutorResponseAction({ message: '' }, formData);
            if (result.role === 'assistant' && result.content) {
                setMessages(prev => [...prev, { role: 'assistant', content: result.content! }]);
            } else {
                setError(result.message || 'An unexpected error occurred.');
            }
        } catch (e: any) {
             setError(e.message || 'An unexpected error occurred.');
        }

        setIsLoading(false);
    };

    const handlePlayAudio = async (text: string) => {
        if (audioRef.current && isPlaying) {
            if (!audioRef.current.paused) {
                audioRef.current.pause();
                setIsPlaying(false);
                return;
            }
        }

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => setIsPlaying(false);
            setIsPlaying(true);
            window.speechSynthesis.speak(utterance);
        } else {
            toast({ title: "Text-to-Speech Unavailable", description: "Your browser does not support speech synthesis.", variant: "destructive" });
        }
    };

    const { isListening, startListening, stopListening } = useSpeechRecognition((transcript) => {
        setCurrentMessage(transcript);
        handleSendMessage(transcript);
    });

    useEffect(() => {
        const onEnded = () => setIsPlaying(false);
        const audio = audioRef.current;
        audio?.addEventListener('ended', onEnded);
        return () => {
            audio?.removeEventListener('ended', onEnded);
            window.speechSynthesis?.cancel();
        };
    }, []);

    return (
        <Card className="flex flex-col h-full max-w-4xl mx-auto">
            <audio ref={audioRef} className="hidden" />
            <CardHeader>
                <CardTitle className="font-headline">Chat with your Tutor</CardTitle>
                <CardDescription>Ask questions and get answers based on the material you provided.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-4">
                <ScrollArea className="flex-grow h-[500px] pr-4" viewportRef={viewportRef}>
                   <div className="space-y-6">
                        {messages.map((message, index) => (
                            <div key={index} className={cn("flex items-start gap-4", message.role === 'user' ? 'justify-end' : '')}>
                                {message.role === 'assistant' && <Avatar className="h-9 w-9 border"><AvatarFallback><Bot size={22} /></AvatarFallback></Avatar>}
                                <div className="flex flex-col gap-2 max-w-lg">
                                    <div className={cn("p-4 rounded-2xl", message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card border rounded-bl-none')}>
                                        <p className="text-sm">{message.content}</p>
                                         {message.role === 'assistant' && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 mt-2" onClick={() => handlePlayAudio(message.content)}>
                                                <Volume2 className={cn("w-4 h-4", isPlaying && "text-primary")} />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {message.role === 'user' && <Avatar className="h-9 w-9"><AvatarImage src="https://picsum.photos/seed/user1/100/100" alt="User avatar" data-ai-hint="person portrait" /><AvatarFallback>U</AvatarFallback></Avatar>}
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex items-start gap-4">
                                <Avatar className="h-9 w-9 border"><AvatarFallback><Bot size={22} /></AvatarFallback></Avatar>
                                <div className="p-4 rounded-2xl bg-card border rounded-bl-none space-y-2 w-64">
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                            </div>
                        )}
                        {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Request Failed</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                   </div>
                </ScrollArea>
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(currentMessage); }} className="flex items-center gap-2 pt-4 border-t">
                    <Button
                      type="button"
                      size="icon"
                      variant={isListening ? 'destructive' : 'outline'}
                      onClick={isListening ? stopListening : startListening}
                      disabled={!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)}
                      title={(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition ? "Click to speak" : "Speech recognition not available"}
                    >
                        <Mic className={cn("h-4 w-4", isListening && "animate-pulse")} />
                    </Button>
                    <input
                        placeholder="Ask a question..."
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        className="flex-grow bg-background border border-input rounded-md px-3 py-2 text-sm"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !currentMessage.trim()}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
