
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, User, Mic, Square, CircleDashed } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { type Message } from '@/lib/types';
import { generateVoiceTutorResponseAction } from "@/server/actions";
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';


type VoiceTutorProps = {
    documentText: string;
};

export default function VoiceTutor({ documentText }: VoiceTutorProps) {
    const { language } = useLanguage();
    const [messages, setMessages] = useState<Message[]>(() => [
        { role: 'assistant', content: documentText ? "I have your document. Click the mic to ask me anything about it." : "Hello! Click the mic and ask me a question." }
    ]);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const viewportRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, isProcessing]);

    const processAndSendAudio = async (audioBlob: Blob) => {
        setIsProcessing(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const audioDataUri = reader.result as string;

                const formData = new FormData();
                formData.append('audioDataUri', audioDataUri);
                formData.append('documentText', documentText);
                formData.append('language', language);
                
                try {
                    const result = await generateVoiceTutorResponseAction({ message: '' }, formData);
                    
                    setMessages(prev => [
                        ...prev,
                        { role: 'user', content: result.transcribedQuestion },
                        { role: 'assistant', content: result.assistantResponse, audioData: result.audioData }
                    ]);

                    if (audioRef.current && result.audioData) {
                        audioRef.current.src = result.audioData;
                        audioRef.current.play();
                    }

                } catch (e: any) {
                    toast({ title: "Error", description: e.message || "Failed to get a response.", variant: 'destructive' });
                } finally {
                    setIsProcessing(false);
                }
            };
        } catch (e) {
            toast({ title: "Error processing audio", variant: "destructive" });
            setIsProcessing(false);
        }
    }


    const handleRecording = async () => {
        if (isRecording) {
            // Stop recording
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop();
            }
            setIsRecording(false);
            // onstop will trigger processing
            return;
        }

        // Start recording
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Use a specific mimeType if available, otherwise let the browser decide.
            const options = { mimeType: 'audio/webm;codecs=opus' };
            const recorder = new MediaRecorder(stream, MediaRecorder.isTypeSupported(options.mimeType) ? options : undefined);
            
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            recorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                
                if (audioBlob.size < 1000) {
                    toast({ title: "Recording too short", description: "Please record for a longer duration.", variant: "destructive" });
                    setIsProcessing(false);
                    return;
                }
                await processAndSendAudio(audioBlob);
            };

            recorder.start();
            setIsRecording(true);
            setIsProcessing(true); // Show loader immediately
        } catch (error) {
            console.error("Microphone access denied:", error);
            toast({ title: "Microphone Access Denied", description: "Please allow microphone access in your browser settings.", variant: "destructive" });
            setIsRecording(false);
            setIsProcessing(false);
        }
    };
    
    const isBusy = isRecording || isProcessing;

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <audio ref={audioRef} className="hidden" />
            <ScrollArea className="flex-grow h-[500px] pr-4" viewportRef={viewportRef}>
               <div className="space-y-6">
                    {messages.map((message, index) => (
                        <div key={index} className={cn("flex items-start gap-4", message.role === 'user' ? 'justify-end' : '')}>
                            {message.role === 'assistant' && <Avatar className="h-9 w-9 border"><AvatarFallback><Bot size={22} /></AvatarFallback></Avatar>}
                            <div className="flex flex-col gap-2 max-w-lg">
                                <div className={cn("p-4 rounded-2xl", message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card border rounded-bl-none')}>
                                    <p className="text-sm">{message.content}</p>
                                </div>
                            </div>
                            {message.role === 'user' && <Avatar className="h-9 w-9"><AvatarImage src="https://picsum.photos/seed/user1/100/100" alt="User avatar" data-ai-hint="person portrait" /><AvatarFallback>U</AvatarFallback></Avatar>}
                        </div>
                    ))}
                    {isProcessing && !isRecording && (
                         <div className="flex items-start gap-4">
                            <Avatar className="h-9 w-9 border"><AvatarFallback><Bot size={22} /></AvatarFallback></Avatar>
                            <div className="p-4 rounded-2xl bg-card border rounded-bl-none space-y-2 w-64">
                                <p className="text-sm italic text-muted-foreground">Thinking...</p>
                            </div>
                        </div>
                    )}
               </div>
            </ScrollArea>
             <div className="flex-none pt-8 space-y-6">
                <div className="flex w-full justify-center">
                    <Button
                        size="icon"
                        className={cn(
                            "relative rounded-full h-24 w-24 md:h-24 md:w-24 text-white shadow-2xl transition-all duration-300 ease-out",
                            isRecording ? 'bg-red-500 hover:bg-red-600 scale-105' : 'primary-gradient hover:scale-105',
                            isProcessing && !isRecording && 'bg-muted hover:bg-muted cursor-not-allowed'
                        )}
                        onClick={handleRecording}
                        disabled={isProcessing && !isRecording}
                    >
                         {isProcessing && !isRecording ? (
                            <CircleDashed className="h-10 w-10 animate-spin" />
                         ) : isRecording ? (
                            <Square className="h-8 w-8 animate-pulse fill-white" />
                         ) : (
                            <Mic className="h-10 w-10" />
                         )}
                    </Button>
                </div>
                 <p className="text-center text-muted-foreground text-sm">
                    {isRecording ? "Recording... Click again to stop." : "Click the mic to start speaking."}
                 </p>
             </div>
        </div>
    );
}
