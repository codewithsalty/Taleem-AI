
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Library, Share2, ScrollText, Headphones, Map, Copy, ListChecks } from 'lucide-react';
import type { StudySuiteOutput } from "@/server/actions";
import FlashcardDisplay from '../flashcards/flashcard-display';
import QuizDisplay from '../quiz-generator/quiz-display';

const outputOptions = [
    { id: 'guide', title: 'Study Guide', icon: <ScrollText className="w-4 h-4"/> },
    { id: 'audio', title: 'Audio Lesson', icon: <Headphones className="w-4 h-4"/> },
    { id: 'map', title: 'Concept Map', icon: <Map className="w-4 h-4"/> },
    { id: 'flashcards', title: 'Flashcards', icon: <Copy className="w-4 h-4"/> },
    { id: 'quiz', title: 'Practice Quiz', icon: <ListChecks className="w-4 h-4"/> },
];

type StudySuiteOutputProps = {
  output?: StudySuiteOutput;
  isLoading: boolean;
};

const GeneratingState = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="font-semibold text-lg">Generating {title}...</p>
        <p className="text-sm text-muted-foreground">This may take a moment. Please wait.</p>
    </div>
);

const PlaceholderState = () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-4 bg-muted/30 rounded-lg border-dashed border-2">
        <p className="font-semibold text-lg text-muted-foreground">Your generated content will appear here.</p>
        <p className="text-sm text-muted-foreground">Upload content and select generation options to get started.</p>
    </div>
);

const OutputCard = ({ title, content, isLoading, children }: { title: string, content: any, isLoading: boolean, children: React.ReactNode }) => {

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="font-headline">{title}</CardTitle>
                <CardDescription>Your generated content is ready.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[250px]">
                {isLoading && !content ? <GeneratingState title={title} /> : content ? children : <PlaceholderState />}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" disabled={isLoading || !content}>
                    <Download className="w-4 h-4 mr-2" /> Download
                </Button>
                <Button variant="outline" size="sm" disabled={isLoading || !content}>
                    <Library className="w-4 h-4 mr-2" /> Save
                </Button>
                 <Button variant="outline" size="sm" disabled={isLoading || !content}>
                    <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function StudySuiteOutputComponent({ output, isLoading }: StudySuiteOutputProps) {
  const generatedTabs = outputOptions.filter(option => output && output[option.id as keyof typeof output]);
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (generatedTabs.length > 0 && !activeTab) {
      setActiveTab(generatedTabs[0].id);
    } else if (generatedTabs.length > 0 && !generatedTabs.find(t => t.id === activeTab)) {
      setActiveTab(generatedTabs[0].id);
    } else if (generatedTabs.length === 0) {
      setActiveTab(undefined);
    }
  }, [generatedTabs, activeTab]);

  if (!isLoading && !output) {
      return (
          <div className="sticky top-4">
              <PlaceholderState />
          </div>
      );
  }

  if (isLoading && !output) {
      return (
          <div className="sticky top-4">
              <GeneratingState title="Study Suite" />
          </div>
      );
  }

  return (
    <div className="sticky top-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 h-16">
                {outputOptions.map(option => (
                    <TabsTrigger 
                        key={option.id} 
                        value={option.id} 
                        className="flex flex-col gap-1 h-full"
                        disabled={!output?.[option.id as keyof typeof output]}
                    >
                        {option.icon}
                        <span className="hidden sm:block text-xs">{option.title}</span>
                    </TabsTrigger>
                ))}
            </TabsList>

            <TabsContent value="guide">
                <OutputCard title="Study Guide" content={output?.guide} isLoading={isLoading}>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-lg mb-2">Summary</h3>
                            <p className="text-sm bg-muted/50 p-3 rounded-md">{output?.guide?.summary}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-2">Key Points</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm bg-muted/50 p-3 rounded-md">
                                {output?.guide?.keyPoints.map((point, i) => <li key={i}>{point}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-2">Practice Questions</h3>
                            <div className="space-y-2 text-sm bg-muted/50 p-3 rounded-md">
                            {output?.guide?.practiceQuestions.map((qa, i) => (
                                <div key={i}>
                                    <p className="font-semibold">{qa.question}</p>
                                    <p className="text-muted-foreground">A: {qa.answer}</p>
                                </div>
                            ))}
                            </div>
                        </div>
                    </div>
                </OutputCard>
            </TabsContent>
            <TabsContent value="audio">
                 <OutputCard title="Audio Lesson" content={output?.audio} isLoading={isLoading}>
                    {output?.audio?.title && <h3 className="font-bold text-lg mb-2">{output.audio.title}</h3>}
                    <div className="space-y-3 bg-muted/50 p-4 rounded-md">
                      {output?.audio?.script?.map((line, i) => (
                        <div key={i} className={`p-2 rounded-lg ${line.speaker === 'Tutor' ? 'bg-primary/10 border-l-4 border-primary' : 'bg-secondary/10 border-l-4 border-secondary'}`}>
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{line.speaker}</span>
                          <p className="text-sm mt-1">{line.dialogue}</p>
                        </div>
                      ))}
                    </div>
                 </OutputCard>
            </TabsContent>
            <TabsContent value="map">
                 <OutputCard title="Concept Map" content={output?.map} isLoading={isLoading}>
                    <pre className="bg-muted/50 p-4 rounded-md overflow-x-auto">
                        <code>{output?.map?.mermaidGraph}</code>
                    </pre>
                 </OutputCard>
            </TabsContent>
            <TabsContent value="flashcards">
                <OutputCard title="Flashcards" content={output?.flashcards} isLoading={isLoading}>
                    <FlashcardDisplay flashcards={output?.flashcards} />
                </OutputCard>
            </TabsContent>
            <TabsContent value="quiz">
                 <OutputCard title="Practice Quiz" content={output?.quiz} isLoading={isLoading}>
                    <QuizDisplay quiz={output?.quiz} questionType="MCQ" />
                 </OutputCard>
            </TabsContent>
        </Tabs>
    </div>
  );
}
