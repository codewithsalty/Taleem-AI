
'use client';

import { motion } from 'framer-motion';
import { Award, BookOpen, BrainCircuit, Database, Gamepad2, Mic, Presentation, Sparkles, Youtube } from 'lucide-react';
import Footer from '@/components/shared/footer';
import PublicHeader from '@/components/shared/public-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
    {
      icon: <Mic className="w-8 h-8 text-primary" />,
      title: 'Voice-First Learning',
      description: 'Interact with your lessons naturally by speaking in Urdu or English. Ask questions, get spoken answers, and navigate the app hands-free.',
    },
    {
      icon: <Database className="w-8 h-8 text-primary" />,
      title: 'Curriculum-Grounded RAG',
      description: 'Our AI provides answers grounded in official Pakistani curriculum textbooks and your uploaded notes, ensuring relevance and accuracy.',
    },
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: 'The Smart Study Suite',
      description: 'Upload any document and instantly generate AI Notes, interactive Quizzes, Flashcards, and even professional Presentations.',
    },
    {
      icon: <Youtube className="w-8 h-8 text-primary" />,
      title: 'YouTube Video Summaries',
      description: 'Paste a video link and get a concise summary of the key points, saving you hours of watch time.',
    },
     {
      icon: <BookOpen className="w-8 h-8 text-primary" />,
      title: 'Past Paper Analysis',
      description: 'Analyze past exam papers to identify recurring, high-importance questions and focus your study efforts effectively.',
    },
    {
      icon: <Award className="w-8 h-8 text-primary" />,
      title: 'Gamified Experience',
      description: 'Make learning fun by earning points for completing tasks, maintaining streaks, and unlocking achievements as you level up from \'Beginner\' to \'Ustaad\'.',
    },
     {
      icon: <Gamepad2 className="w-8 h-8 text-primary" />,
      title: 'Educational Games',
      description: 'Reinforce your knowledge with fun and interactive games like \'Map Master\' and \'Subject Sprint\' in our dedicated Games Center.',
    },
     {
      icon: <BrainCircuit className="w-8 h-8 text-primary" />,
      title: 'Personalized Dashboard',
      description: 'Track your progress with a comprehensive overview of your stats, including level, points, streaks, and performance across different subjects.',
    },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};


export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <PublicHeader />
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative w-full py-28 md:py-40 overflow-hidden">
                    <div className="absolute inset-0 -z-10 h-full w-full bg-background gradient-mesh-background"/>
                    <div className="container mx-auto px-4 text-center relative z-10 pt-16">
                        <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        >
                        <h1 className="text-5xl md:text-7xl font-bold font-headline text-foreground mb-4 leading-tight">
                            The Future of 
                            <br />
                            <span className="text-6xl md:text-8xl font-extrabold highlight-gradient">
                                Personalized Learning.
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
                            Taleem AI is more than just an app; it's a revolutionary learning companion built on cutting-edge AI to make education in Pakistan more accessible, interactive, and effective.
                        </p>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-headline font-bold">Our Features</h2>
                        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                            A complete suite of tools designed for the modern student.
                        </p>
                    </div>
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                        >
                            <Card className="bg-card border border-border/50 transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-primary/20 card-glow h-full">
                            <CardHeader className="items-center text-center">
                                <div className="p-4 bg-primary/10 rounded-full mb-4">
                                {feature.icon}
                                </div>
                                <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                    </motion.div>
                </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
