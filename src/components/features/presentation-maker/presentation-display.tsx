
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ArrowRight, Download, Maximize, Minimize } from 'lucide-react';
import EmptyState from '@/components/shared/empty-state';
import { type PresentationData, type PresentationSlide } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import PptxGenJS from 'pptxgenjs';

type PresentationDisplayProps = {
  presentation?: PresentationData;
  isLoading?: boolean;
};

const Slide = ({ title, content, imageUrl }: PresentationSlide) => (
    <div className="relative bg-card w-full h-full flex flex-col justify-center items-center p-8 md:p-16 text-center overflow-hidden">
        {imageUrl && (
            <div
                className="absolute inset-0 bg-cover bg-center z-0 opacity-20"
                style={{ backgroundImage: `url(${imageUrl})` }}
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50 z-0"/>
        <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary mb-6">{title}</h2>
            <ul className="space-y-4 text-lg md:text-xl text-foreground/80">
                {content.map((point, i) => (
                    <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 * i }}
                    >
                        {point}
                    </motion.li>
                ))}
            </ul>
        </div>
    </div>
);


export default function PresentationDisplay({ presentation, isLoading }: PresentationDisplayProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    if (!presentation) {
        toast({
            title: "Error",
            description: "No presentation data to export.",
            variant: "destructive"
        });
        return;
    }

    let pptx = new PptxGenJS();
    
    // Title Slide
    let titleSlide = pptx.addSlide();
    titleSlide.addText(presentation.title, { 
        x: 0.5, y: 2.5, w: '90%', h: 1, align: 'center', fontSize: 48, bold: true, color: '6366f1' 
    });
    if (presentation.slides[0]?.imageUrl) {
        titleSlide.background = { data: presentation.slides[0].imageUrl };
    }


    // Agenda Slide
    const agendaSlide = pptx.addSlide();
    agendaSlide.addText("Agenda", { x: 0.5, y: 0.5, w: '90%', h: 1, fontSize: 36, bold: true, color: 'FFFFFF' });
    agendaSlide.addText(presentation.agenda.join('\n'), { x: 1, y: 1.5, w: '80%', h: 4, bullet: true, fontSize: 24, color: 'F8FAFC' });
    if (presentation.slides[1]?.imageUrl) {
        agendaSlide.background = { data: presentation.slides[1].imageUrl };
    } else {
        agendaSlide.background = { color: '1E293B' };
    }


    // Content Slides
    presentation.slides.forEach(slide => {
        const pptxSlide = pptx.addSlide();
         if (slide.imageUrl) {
            pptxSlide.background = { data: slide.imageUrl };
        }
        pptxSlide.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: '0F172A', transparency: 30 } });
        pptxSlide.addText(slide.title, { x: 0.5, y: 0.5, w: '90%', h: 1, align: 'left', fontSize: 32, bold: true, color: 'FFFFFF' });
        pptxSlide.addText(slide.content.join('\n'), { x: 0.5, y: 1.5, w: '90%', h: 5, bullet: { type: 'bullet' }, fontSize: 20, color: 'F8FAFC' });
    });

    // Thank You Slide
    let thankYouSlide = pptx.addSlide();
    thankYouSlide.addText("Thank You", { 
        x: 0.5, y: 2.5, w: '90%', h: 1, align: 'center', fontSize: 48, bold: true, color: '6366f1'
    });
    if (presentation.slides[presentation.slides.length - 1]?.imageUrl) {
        thankYouSlide.background = { data: presentation.slides[presentation.slides.length - 1].imageUrl };
    }


    pptx.writeFile({ fileName: `${presentation.title.replace(/\s/g, '_')}.pptx` });
    
    toast({
      title: "Exporting Presentation",
      description: "Your download will begin shortly.",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="w-full h-[500px]" />
        </CardContent>
      </Card>
    );
  }

  if (!presentation) {
    return (
      <Card className="flex flex-col items-center justify-center w-full h-[550px] border-dashed">
        <CardContent className="text-center">
          <EmptyState
            title="Your Presentation Will Appear Here"
            description="Provide a topic or text and let the AI build your slides."
          />
        </CardContent>
      </Card>
    );
  }
  
  const allSlides = [
    { title: presentation.title, content: ["An AI-Generated Presentation"], imageUrl: presentation.slides[0]?.imageUrl },
    { title: "Agenda", content: presentation.agenda, imageUrl: presentation.slides[1]?.imageUrl },
    ...presentation.slides,
    { title: "Thank You", content: ["Q&A Session"], imageUrl: presentation.slides[presentation.slides.length-1]?.imageUrl }
  ];

  const handleNext = () => setCurrentSlide(prev => Math.min(prev + 1, allSlides.length - 1));
  const handlePrev = () => setCurrentSlide(prev => Math.max(0, prev - 1));

  const progress = (currentSlide / (allSlides.length - 1)) * 100;

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'w-full'}`}>
        <Card className={`flex flex-col overflow-hidden shadow-2xl card-glow ${isFullscreen ? 'h-full w-full border-0 rounded-none' : 'h-[550px]'}`}>
            <div className="flex-grow relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0"
                    >
                        <Slide 
                            title={allSlides[currentSlide].title} 
                            content={allSlides[currentSlide].content} 
                            imageUrl={allSlides[currentSlide].imageUrl}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
            
            <div className="p-4 border-t bg-card/80 backdrop-blur-sm flex items-center gap-4">
                 <Button variant="ghost" size="icon" onClick={handlePrev} disabled={currentSlide === 0}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-grow text-center text-sm text-muted-foreground">
                    Slide {currentSlide + 1} of {allSlides.length}
                </div>
                <Button variant="ghost" size="icon" onClick={handleNext} disabled={currentSlide === allSlides.length - 1}>
                    <ArrowRight className="w-5 h-5" />
                </Button>
            </div>
            <Progress value={progress} className="h-1 rounded-none" />
        </Card>
        
        <div className={`absolute top-4 ${isFullscreen ? 'right-4' : 'right-4' } flex gap-2`}>
            <Button variant="outline" size="icon" onClick={handleExport}>
                <Download className="w-5 h-5" />
                 <span className="sr-only">Export to PPTX</span>
            </Button>
            <Button variant="outline" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                 <span className="sr-only">Toggle Fullscreen</span>
            </Button>
        </div>
    </div>
  );
}
