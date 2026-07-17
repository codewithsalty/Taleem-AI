import FlashcardForm from '@/components/features/flashcards/flashcard-form';

export default function FlashcardsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-2">Smart Flashcards</h1>
      <p className="text-muted-foreground mb-6">
        Paste your notes or any text, and our AI will generate a set of flashcards for you to study.
      </p>
      <FlashcardForm />
    </div>
  );
}
