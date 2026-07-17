
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import EmptyState from '@/components/shared/empty-state';
import { useToast } from '@/hooks/use-toast';
import MermaidRenderer from './mermaid-renderer';

type MindMapDisplayProps = {
  mermaidGraph?: string;
  isLoading?: boolean;
};

export default function MindMapDisplay({ mermaidGraph, isLoading }: MindMapDisplayProps) {
  const { toast } = useToast();

  const handleDownload = () => {
    if (mermaidGraph) {
      const svgElement = document.querySelector('#mermaid-graph svg');
      if (svgElement) {
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svgElement);
        // Add name spaces.
        if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if(!source.match(/^<svg[^>]+xmlns:xlink="http\:\/\/www\.w3\.org\/1999\/xlink"/)){
            source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }
        // Add xml declaration
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

        const url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = "mind-map.svg";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
         toast({
          title: "Downloaded as SVG",
          description: "Your mind map has been saved.",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="w-full h-[400px]" />
        </CardContent>
      </Card>
    );
  }

  if (!mermaidGraph) {
    return (
      <Card className="flex flex-col items-center justify-center w-full h-[450px] border-dashed">
        <CardContent className="text-center">
          <EmptyState
            title="Your Mind Map Will Appear Here"
            description="Paste your notes and click 'Generate Mind Map' to visualize your ideas."
            ctaText="Generate Mind Map"
            ctaLink="#text"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Mind Map</CardTitle>
        <CardDescription>
          Here is a visual representation of your notes. You can download it as an SVG.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-4 bg-muted/30 rounded-lg">
        <div id="mermaid-graph" className="w-full">
            <MermaidRenderer graph={mermaidGraph} />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" /> Download SVG
        </Button>
      </CardFooter>
    </Card>
  );
}
