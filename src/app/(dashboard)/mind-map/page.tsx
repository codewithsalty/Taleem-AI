
import MindMapForm from '@/components/features/mind-map/mind-map-form';

export default function MindMapPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-2">AI Mind Map Generator</h1>
      <p className="text-muted-foreground mb-6">
        Transform your notes into a visual concept map. Paste your text to see how ideas connect.
      </p>
      <MindMapForm />
    </div>
  );
}
