

'use client';

import { useState, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Sparkles, Loader2, List, Trash2, Image as ImageIcon, BrainCircuit, Copy, AlertCircle, FileQuestion, BadgeHelp, Check, ThumbsUp } from 'lucide-react';
import EmptyState from '@/components/shared/empty-state';
import { analyzePastPaper } from "@/server/ai/flows/past-paper-analyzer-flow";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { type AnalyzePastPaperOutput } from "@/server/ai/flows/past-paper-analyzer-flow";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { generateQuizAction, generateFlashcardsAction, identifyImportantQuestionsAction, type QuizFormState, type FlashcardFormState, type ImportantQuestionsFormState } from "@/server/actions";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import QuizDisplay from '@/components/features/quiz-generator/quiz-display';
import FlashcardDisplay from '@/components/features/flashcards/flashcard-display';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


async function fileToDataURI(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${file.type};base64,${buffer.toString('base64')}`;
}

const AnalysisResultDisplay = ({ results, onGenerateImportantQuestions }: { results: AnalyzePastPaperOutput[], onGenerateImportantQuestions: () => void }) => {
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [quizState, setQuizState] = useState<QuizFormState | null>(null);
    const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);

    const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
    const [flashcardState, setFlashcardState] = useState<FlashcardFormState | null>(null);
    const [isFlashcardDialogOpen, setIsFlashcardDialogOpen] = useState(false);

    const handleGenerateQuiz = async () => {
        setIsGeneratingQuiz(true);
        setQuizState(null);

        const allQuestionsText = results
            .flatMap(r => r.sections.flatMap(s => s.questions.map(q => q.questionText)))
            .join('\n');

        const formData = new FormData();
        formData.append('topic', `Questions from past papers: ${allQuestionsText.substring(0, 500)}`);
        formData.append('questionType', 'MCQ');
        formData.append('questionCount', '10');
        formData.append('difficulty', 'Intermediate');
        
        const result = await generateQuizAction({ message: '' }, formData);
        setQuizState(result);
        setIsGeneratingQuiz(false);
        setIsQuizDialogOpen(true);
    };
    
     const handleGenerateFlashcards = async () => {
        setIsGeneratingFlashcards(true);
        setFlashcardState(null);

        const allQuestionsText = results
            .flatMap(r => r.sections.flatMap(s => s.questions.map(q => q.questionText)))
            .join('\n');

        const formData = new FormData();
        formData.append('text', allQuestionsText);
        
        const result = await generateFlashcardsAction({ message: '' }, formData);
        setFlashcardState(result);
        setIsGeneratingFlashcards(false);
        setIsFlashcardDialogOpen(true);
    };
    
    const { pending: isIdentifying } = useFormStatus();

    return (
        <>
            <div className="text-left w-full">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold font-headline mb-1">Analysis Complete</h2>
                    <p className="text-muted-foreground">
                        Analyzed {results.length} paper(s). Review the extracted questions and generate study materials.
                    </p>
                </div>
                
                <div className="space-y-4 mb-8">
                    <h3 className="font-semibold text-lg text-primary flex items-center gap-2"><FileQuestion className="w-5 h-5"/> Extracted Questions</h3>
                    <Accordion type="multiple" className="w-full space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {results.map((result, resultIndex) => (
                            <AccordionItem value={`result-${resultIndex}`} key={resultIndex} className="border rounded-lg bg-muted/30 px-4">
                                <AccordionTrigger className="hover:no-underline font-semibold text-base">
                                    {result.subject} ({result.year || 'Unknown Year'})
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 border-t">
                                    <Accordion type="single" collapsible className="w-full space-y-2">
                                        {result.sections.map((section, sectionIndex) => (
                                            <AccordionItem value={`section-${sectionIndex}`} key={sectionIndex} className="border rounded-lg bg-background/50 px-3">
                                                <AccordionTrigger className="hover:no-underline font-semibold text-sm">{section.sectionTitle}</AccordionTrigger>
                                                <AccordionContent className="pt-2 border-t">
                                                    <ul className="space-y-3">
                                                        {section.questions.map((q, qIndex) => (
                                                            <li key={qIndex} className="p-3 bg-muted/20 rounded-md border text-sm">
                                                                <div className="flex justify-between items-start">
                                                                    <p className="flex-grow pr-4">{q.questionText}</p>
                                                                    <div className="text-right">
                                                                        {q.marks && <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{q.marks} Marks</span>}
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                <div className="space-y-6">
                    <h3 className="font-semibold text-lg text-primary flex items-center gap-2"><Sparkles className="w-5 h-5"/> Generate Study Materials</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button variant="outline" size="lg" className="h-auto" onClick={handleGenerateQuiz} disabled={isGeneratingQuiz}>
                             <div className="flex items-center gap-3 p-2">
                                {isGeneratingQuiz ? <Loader2 className="w-6 h-6 animate-spin"/> : <BrainCircuit className="w-6 h-6"/>}
                                <div className="text-left">
                                    <p className="font-semibold">Generate Practice Quiz</p>
                                    <p className="text-xs text-muted-foreground">Test your knowledge.</p>
                                </div>
                            </div>
                        </Button>
                        <Button variant="outline" size="lg" className="h-auto" onClick={handleGenerateFlashcards} disabled={isGeneratingFlashcards}>
                             <div className="flex items-center gap-3 p-2">
                                 {isGeneratingFlashcards ? <Loader2 className="w-6 h-6 animate-spin"/> : <Copy className="w-6 h-6"/>}
                                <div className="text-left">
                                    <p className="font-semibold">Generate Flashcards</p>
                                    <p className="text-xs text-muted-foreground">For quick revision.</p>
                                </div>
                            </div>
                        </Button>
                    </div>
                     <Button type="submit" variant="default" size="lg" className="w-full h-auto" onClick={onGenerateImportantQuestions} disabled={isIdentifying}>
                        <div className="flex items-center gap-3 p-2">
                             {isIdentifying ? <Loader2 className="w-6 h-6 animate-spin"/> : <BadgeHelp className="w-6 h-6"/>}
                            <div className="text-left">
                                <p className="font-semibold">Identify Important Questions</p>
                                <p className="text-xs text-primary-foreground/80">Find frequently asked topics.</p>
                            </div>
                        </div>
                    </Button>
                </div>
            </div>

            {/* Quiz Dialog */}
            <AlertDialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
                <AlertDialogContent className="max-w-4xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Generated Practice Quiz</AlertDialogTitle>
                        <AlertDialogDescription>Here is a practice quiz generated from your past papers.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto p-4">
                        {isGeneratingQuiz ? <Loader2 className="h-8 w-8 animate-spin text-primary"/> : null}
                        {quizState?.quiz && <QuizDisplay quiz={quizState.quiz} />}
                        {quizState?.message && quizState.message.includes('error') && (
                             <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Generation Failed</AlertTitle>
                                <AlertDescription>{quizState.message}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            {/* Flashcard Dialog */}
            <AlertDialog open={isFlashcardDialogOpen} onOpenChange={setIsFlashcardDialogOpen}>
                <AlertDialogContent className="max-w-4xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Generated Flashcards</AlertDialogTitle>
                        <AlertDialogDescription>Here are flashcards for quick revision.</AlertDialogDescription>
                    </AlertDialogHeader>
                     <div className="max-h-[60vh] overflow-y-auto p-4">
                        {isGeneratingFlashcards ? <Loader2 className="h-8 w-8 animate-spin text-primary"/> : null}
                        {flashcardState?.flashcards && <FlashcardDisplay flashcards={flashcardState.flashcards} />}
                        {flashcardState?.message && flashcardState.message.includes('error') && (
                             <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Generation Failed</AlertTitle>
                                <AlertDescription>{flashcardState.message}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};


export default function PastPapersPage() {
    const [uploadedPapers, setUploadedPapers] = useState<File[]>([]);
    const [analysisResults, setAnalysisResults] = useState<AnalyzePastPaperOutput[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // State for Important Questions feature
    const [isImportantQuestionsDialogOpen, setIsImportantQuestionsDialogOpen] = useState(false);
    const initialImportantState: ImportantQuestionsFormState = { message: '', errors: {} };
    const [importantQuestionsState, identifyQuestionsAction] = useActionState(identifyImportantQuestionsAction, initialImportantState);
    const { pending: isIdentifying } = useFormStatus();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            setUploadedPapers(prev => {
                const newFiles = Array.from(files);
                const updatedPapers = [...prev];
                newFiles.forEach(newFile => {
                    if (!updatedPapers.some(existingFile => existingFile.name === newFile.name && existingFile.lastModified === newFile.lastModified)) {
                        updatedPapers.push(newFile);
                    }
                });
                return updatedPapers;
            });
        }
         if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    
    const handleRemoveUploadedPaper = (indexToRemove: number) => {
        setUploadedPapers(prev => prev.filter((_, index) => index !== indexToRemove));
    }


    const handleAnalysis = async () => {
        if (uploadedPapers.length === 0) {
            setAnalysisError("Please upload at least one paper before analyzing.");
            return;
        }
        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysisResults([]);

        try {
            const analysisPromises = uploadedPapers.map(async (paper) => {
                const dataUri = await fileToDataURI(paper);
                return analyzePastPaper({ dataUri });
            });
            
            const results = await Promise.all(analysisPromises);
            setAnalysisResults(results.filter(r => r) as AnalyzePastPaperOutput[]);

        } catch (e: any) {
            setAnalysisError(e.message || "An unknown error occurred during analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    }
    
    const allQuestions = analysisResults.flatMap(r => r.sections.flatMap(s => s.questions.map(q => q.questionText)));

    return (
        <div>
            <h1 className="text-3xl font-bold font-headline mb-2">Past Paper Creator</h1>
            <p className="text-muted-foreground mb-6">
                Upload past papers to build a knowledge base, generate new practice exams, and identify key questions.
            </p>
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline">
                                <Upload className="w-5 h-5" />
                                1. Upload Papers
                            </CardTitle>
                            <CardDescription>
                                Add one or more papers (PDF, JPG, PNG) to your knowledge base.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <FileText className="w-8 h-8 mb-4 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag & drop</p>
                                        <p className="text-xs text-muted-foreground">Images, PDF, DOCX, etc.</p>
                                    </div>
                                    <Input 
                                        id="dropzone-file" 
                                        name="files" 
                                        type="file" 
                                        className="hidden" 
                                        onChange={handleFileChange} 
                                        accept=".pdf,.docx,.jpg,.jpeg,.png"
                                        multiple 
                                        ref={fileInputRef}
                                    />
                                </label>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline">
                                <List className="w-5 h-5"/>
                                Paper Knowledge Base
                            </CardTitle>
                            <CardDescription>
                                {uploadedPapers.length} paper(s) ready for analysis.
                            </CardDescription>
                        </CardHeader>
                         <CardContent>
                            {uploadedPapers.length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {uploadedPapers.map((paper, index) => (
                                    <div key={index} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                        <p className="text-sm font-medium flex-grow truncate">{paper.name}</p>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveUploadedPaper(index)}>
                                            <Trash2 className="w-4 h-4 text-destructive"/>
                                        </Button>
                                    </div>
                                ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No papers uploaded yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Button size="lg" onClick={handleAnalysis} disabled={isAnalyzing || uploadedPapers.length === 0} className="w-full">
                         {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        2. Analyze Papers
                    </Button>
                     {analysisError && (
                         <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{analysisError}</AlertDescription>
                        </Alert>
                    )}
                </div>
                 <div className="lg:col-span-2">
                    <Card className="flex flex-col items-center justify-center w-full min-h-[500px] border-dashed sticky top-4">
                        <CardContent className="text-center w-full p-6">
                            <form action={identifyQuestionsAction}>
                                {allQuestions.map((q, i) => <input type="hidden" name="questions" value={q} key={i} />)}
                                {isAnalyzing ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="h-12 w-12 animate-spin text-primary"/>
                                        <p className="text-muted-foreground">AI is analyzing {uploadedPapers.length} paper(s)...</p>
                                    </div>
                                ) : analysisResults.length > 0 ? (
                                    <AnalysisResultDisplay results={analysisResults} onGenerateImportantQuestions={() => setIsImportantQuestionsDialogOpen(true)} />
                                ) : (
                                    <EmptyState
                                        title="Your Analysis Will Appear Here"
                                        description="Upload one or more past papers and click 'Analyze' to begin."
                                    />
                                )}
                             </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
            
             <AlertDialog open={isImportantQuestionsDialogOpen} onOpenChange={setIsImportantQuestionsDialogOpen}>
                <AlertDialogContent className="max-w-4xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Important Topics Analysis</AlertDialogTitle>
                        <AlertDialogDescription>Here are the most frequently appearing topics from your papers.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto p-1 min-h-[20rem] flex items-center justify-center">
                        {isIdentifying ? (
                             <div className="flex flex-col items-center gap-4 py-16">
                                <Loader2 className="h-12 w-12 animate-spin text-primary"/>
                                <p className="text-muted-foreground">AI is identifying key topics...</p>
                            </div>
                        ) : importantQuestionsState.importantTopics && importantQuestionsState.importantTopics.length > 0 ? (
                            <Accordion type="multiple" className="w-full space-y-3">
                                {importantQuestionsState.importantTopics.map((item, index) => (
                                    <AccordionItem value={`item-${index}`} key={index} className="border rounded-lg bg-muted/30 px-4">
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex justify-between items-center w-full pr-2">
                                                <span className="font-semibold text-left">{item.topic}</span>
                                                <Badge variant={index < 3 ? "default" : "secondary"}>Appeared {item.frequency} times</Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-2 border-t">
                                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                                {item.relatedQuestions.map((q, qIndex) => <li key={qIndex}>{q}</li>)}
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <EmptyState
                                title="Could Not Identify Topics"
                                description={importantQuestionsState.message || "No recurring topics were found in the provided questions."}
                                ctaText=''
                            />
                        )}
                        {importantQuestionsState.message && !isIdentifying && (!importantQuestionsState.importantTopics || importantQuestionsState.importantTopics.length === 0) && (
                             <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Analysis Failed</AlertTitle>
                                <AlertDescription>{importantQuestionsState.message}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
