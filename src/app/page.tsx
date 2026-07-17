
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, Database, Mic, Star, ArrowRight, BookOpen } from "lucide-react";
import Link from 'next/link';
import PublicHeader from "@/components/shared/public-header";
import Footer from "@/components/shared/footer";
import { motion } from 'framer-motion';
import { useTranslation } from "@/hooks/use-translation";
import VideoPlayer from "@/components/shared/video-player";

const features = [
    {
      icon: <Mic className="w-8 h-8 text-primary" />,
      title: 'Voice-First Learning',
      description: 'Interact with your lessons naturally by speaking in Urdu or English.',
    },
    {
      icon: <Database className="w-8 h-8 text-primary" />,
      title: 'Curriculum-Aligned RAG',
      description: 'Get answers grounded in official Pakistani textbooks, ensuring relevance and accuracy for your grade.',
    },
    {
      icon: <Award className="w-8 h-8 text-primary" />,
      title: 'Gamified Experience',
      description: 'Earn points, unlock badges, and make learning a fun and competitive adventure.',
    },
];

const testimonials = [
    {
      quote: "Taleem AI has transformed how my son studies. The voice tutor is revolutionary!",
      name: "Aisha K.",
      title: "Parent, Grade 5 Student",
      avatar: "https://picsum.photos/seed/aisha/100/100"
    },
    {
      quote: "Finally, a learning tool that understands the Pakistani curriculum. It's an essential app for every student.",
      name: "Hassan R.",
      title: "Educator & Tutor",
       avatar: "https://picsum.photos/seed/hassan/100/100"
    },
     {
      quote: "The study suite is a game-changer. It generated a full summary, quiz, and flashcards from my history notes in seconds!",
      name: "Fatima Z.",
      title: "Grade 8 Student",
       avatar: "https://picsum.photos/seed/fatima/100/100"
    },
];

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative w-full py-24 md:py-32 lg:py-40 overflow-hidden">
           <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-b from-background to-background/80"/>
           <div className="orb orb1"></div>
           <div className="orb orb2"></div>
           <div className="orb orb3"></div>
           <div className="container mx-auto px-4 relative z-10 pt-16 flex justify-center">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <h1 className="text-7xl md:text-9xl font-bold font-headline text-foreground mb-4 leading-tight">
                Learn Smarter,
                <br />
                <span className="text-8xl md:text-[10rem] font-extrabold highlight-gradient">
                  Speak Freely.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
                Welcome to Taleem AI, your personal AI tutor. We offer a voice-first, RAG-powered educational platform aligned with the Pakistani curriculum.
              </p>
              <div className="flex justify-center gap-4 mt-8">
                <Button asChild size="lg" className="h-14 px-10 text-lg font-bold primary-gradient text-white shadow-lg transition-all duration-300 ease-in-out hover:shadow-primary/40 hover:scale-105">
                  <Link href="/signup">Get Started</Link>
                </Button>
                 <Button asChild size="lg" variant="outline" className="h-14 px-10 text-lg font-bold bg-background/50 border-2 border-border text-foreground transition-all duration-300 ease-in-out hover:border-primary hover:bg-primary/10 hover:scale-105">
                  <Link href="/about">Read More</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Video Player Section */}
        <section className="py-20 md:py-24 bg-card/50">
           <div className="container mx-auto px-4">
             <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-headline font-bold">See Taleem AI in Action</h2>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Watch a quick demo to see how our features can transform your learning experience.
                </p>
            </div>
            <VideoPlayer />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">{t('featuresTitle')}</h2>
              <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                {t('featuresSubtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="bg-card border transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-primary/10 card-glow h-full"
                >
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
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 md:py-24 bg-card/50">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold">Don't Just Take Our Word For It</h2>
                    <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                        See what parents, teachers, and students are saying about Taleem AI.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                    <Card
                        key={index}
                        className="bg-card border h-full flex flex-col transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-primary/10 card-glow"
                    >
                        <CardContent className="p-6 flex-grow flex flex-col">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => <Star key={i} className="text-yellow-400 fill-yellow-400 w-5 h-5" />)}
                            </div>
                            <p className="italic text-muted-foreground my-4 flex-grow">"{testimonial.quote}"</p>
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-primary">{testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                </div>
            </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 md:py-32 text-center">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-headline font-bold">Ready to Revolutionize Your Learning?</h2>
                <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">Join thousands of students across Pakistan who are learning smarter with Taleem AI.</p>
                 <div className="mt-8 flex justify-center">
                    <Button asChild size="lg" className="h-14 px-10 text-lg font-bold primary-gradient text-white shadow-2xl transition-all duration-300 ease-in-out hover:shadow-primary/40 hover:scale-105">
                      <Link href="/signup">{t('getStarted')} <ArrowRight className="ml-2 w-5 h-5"/></Link>
                    </Button>
                </div>
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
