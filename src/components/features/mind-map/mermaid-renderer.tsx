
'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Skeleton } from '@/components/ui/skeleton';

// Generate a unique ID for each render
const generateId = () => `mermaid-graph-${Math.random().toString(36).substring(2, 9)}`;

type MermaidRendererProps = {
  graph: string;
};

export default function MermaidRenderer({ graph }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uniqueId] = useState(generateId);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setSvg(null);

    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark', // or 'default', 'forest', 'neutral'
      securityLevel: 'loose',
      fontFamily: 'inherit',
      // @ts-ignore
      flowchart: {
        useMaxWidth: false, // Set to false to allow the graph to expand
        htmlLabels: true,
      },
      // @ts-ignore
      themeVariables: {
        primaryColor: '#1e293b', // card
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#334155', // border
        lineColor: '#475569',
        secondaryColor: '#334155',
        tertiaryColor: '#1e293b',
        fontSize: '16px', // Increased font size
        background: '#0f172a',
        mainBkg: '#1e293b',
        textColor: '#f8fafc',
        nodeBorder: '#6366f1',
      }
    });

    const renderGraph = async () => {
      try {
        if (graph) {
          const { svg } = await mermaid.render(uniqueId, graph);
          if (isMounted) {
            setSvg(svg);
          }
        }
      } catch (e: any) {
        if (isMounted) {
          setError('Failed to render the mind map. The AI may have generated an invalid format.');
          console.error(e);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    renderGraph();

    return () => {
      isMounted = false;
    };
  }, [graph, uniqueId]);

  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  if (error) {
    return <div className="text-destructive p-4 bg-destructive/10 rounded-md">{error}</div>;
  }

  if (svg) {
    // Inject style to make the SVG scale
    const styledSvg = svg.replace('<svg', '<svg style="max-width: 100%; height: auto;"');
    return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: styledSvg }} />;
  }

  return null;
}
