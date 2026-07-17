
'use client';

import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollText, Headphones, Map, Copy, ListChecks } from 'lucide-react';
import { Label } from '@/components/ui/label';

const options = [
    { id: 'guide', icon: <ScrollText className="w-8 h-8" />, title: 'Study Guide', description: 'Summary, Key Points & Practice Questions' },
    { id: 'audio', icon: <Headphones className="w-8 h-8" />, title: 'Audio Lesson', description: 'Conversational 2-voice explanation' },
    { id: 'map', icon: <Map className="w-8 h-8" />, title: 'Concept Map', description: 'Visual mind map of key topics' },
    { id: 'flashcards', icon: <Copy className="w-8 h-8" />, title: 'Smart Flashcards', description: 'Auto-generated Q&A cards' },
    { id: 'quiz', icon: <ListChecks className="w-8 h-8" />, title: 'Practice Quiz', description: '10 questions with explanations' },
];


export default function GenerationOptions() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4">
        {options.map(option => (
          <Card key={option.id} className="transition-all hover:border-primary/50 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
            <Label htmlFor={option.id} className="flex items-center gap-4 p-4 cursor-pointer">
              <div className="p-3 bg-muted rounded-lg text-primary">
                {option.icon}
              </div>
              <div className="flex-grow">
                <p className="font-semibold">{option.title}</p>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
              <Checkbox id={option.id} name={`generate.${option.id}`} className="w-6 h-6" defaultChecked/>
            </Label>
          </Card>
        ))}
      </div>
    </div>
  );
}
