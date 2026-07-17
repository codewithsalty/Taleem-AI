
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download, Image as ImageIcon, ZoomIn } from 'lucide-react';
import EmptyState from '@/components/shared/empty-state';
import { useToast } from '@/hooks/use-toast';
import type { NotesFormState } from '@/lib/actions';
import { Separator } from '@/components/ui/separator';

import MermaidRenderer from '../mind-map/mermaid-renderer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFormStatus } from 'react-dom';


type NotesDisplayProps = {
  state: NotesFormState;
};

export default function NotesDisplay({ state }: NotesDisplayProps) {
  const { toast } = useToast();
  const { pending: isLoading } = useFormStatus();
  const notes = state.notes;

  const handleDownloadText = () => {
    if (notes) {
      let content = `${notes.title}\n\n`;
      content += `SUMMARY:\n${notes.summary}\n\n`;
      notes.sections.forEach(section => {
        content += `-----------------\n`;
        content += `${section.heading.toUpperCase()}\n`;
        content += `-----------------\n`;
        section.content.forEach(point => {
          content += `- ${point}\n`;
        });
        content += `\n`;
      });
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `${notes.title.replace(/ /g, '_')}.txt`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded as TXT",
        description: "Your notes have been saved.",
      });
    }
  };

  const handleDownloadImage = () => {
    if (notes?.diagram) {
        const downloadLink = document.createElement("a");
        downloadLink.href = notes.diagram;
        downloadLink.download = "diagram.png";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
         toast({
          title: "Downloaded as PNG",
          description: "Your diagram has been saved.",
        });
    }
  };

  const handleDownloadSvg = () => {
     if (notes?.conceptMap) {
      const svgElement = document.querySelector('#notes-concept-map svg');
      if (svgElement) {
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svgElement);
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
        const url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = "concept-map.svg";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast({
          title: "Downloaded as SVG",
          description: "Your concept map has been saved.",
        });
      }
    }
  }


  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-24 w-full mt-4" />
            <Skeleton className="h-48 w-full mt-6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!notes) {
    return (
      <Card className="flex flex-col items-center justify-center w-full min-h-[500px] border-dashed">
        <CardContent className="text-center">
          <EmptyState
            title="Your Notes Will Appear Here"
            description="Provide content and click 'Generate Notes' to get started."
            ctaText="Generate Notes"
            ctaLink="#notes-content"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{notes.title}</CardTitle>
        <CardDescription>
          {notes.summary}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto pr-6">
        {notes.sections.map((section, index) => (
          <div key={index}>
            <h3 className="font-bold text-lg font-headline text-primary mb-2 border-b-2 border-primary/50 pb-1">{section.heading}</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {section.content.map((point, pIndex) => (
                <li key={pIndex}>{point}</li>
              ))}
            </ul>
          </div>
        ))}

        {notes.diagram && (
            <div className="space-y-4 pt-4">
                <Separator />
                <h3 className="font-bold text-lg font-headline text-primary flex items-center gap-2"><ImageIcon className="w-5 h-5"/>Generated Diagram</h3>
                <div className="p-4 bg-muted/30 rounded-lg flex justify-center overflow-auto relative group">
                    {/* Using native <img> for Pollinations AI images — they are dynamic external URLs */}
                    <img src={notes.diagram} alt="AI Generated Diagram" className="rounded-md object-contain max-w-full max-h-[400px]" loading="lazy" />
                    <Dialog>
                        <DialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ZoomIn className="w-5 h-5" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                            <DialogHeader>
                                <DialogTitle>Generated Diagram</DialogTitle>
                            </DialogHeader>
                            <div className="flex items-center justify-center p-4">
                                <img src={notes.diagram} alt="AI Generated Diagram" className="rounded-md object-contain max-w-full max-h-[70vh]" />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        )}
        {notes.conceptMap && (
             <div className="space-y-4 pt-4">
                <Separator />
                <h3 className="font-bold text-lg font-headline text-primary">Concept Map</h3>
                 <div className="p-4 bg-muted/30 rounded-lg flex justify-center overflow-auto relative group">
                    <div id="notes-concept-map" className="w-full">
                       <MermaidRenderer graph={notes.conceptMap} />
                    </div>
                     <Dialog>
                        <DialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ZoomIn className="w-5 h-5" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-full h-[95vh] flex items-center justify-center p-8">
                            <div className="w-full h-full">
                                <MermaidRenderer graph={notes.conceptMap} />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex-wrap gap-2 border-t pt-6">
        <Button onClick={handleDownloadText}>
          <Download className="mr-2 h-4 w-4" /> Download Notes
        </Button>
         {notes.diagram && (
          <Button onClick={handleDownloadImage} variant="secondary">
            <Download className="mr-2 h-4 w-4" /> Download Diagram
          </Button>
        )}
        {notes.conceptMap && (
          <Button onClick={handleDownloadSvg} variant="secondary">
            <Download className="mr-2 h-4 w-4" /> Download Map
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
