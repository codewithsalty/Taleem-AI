
'use client';

import { motion } from 'framer-motion';
import { Award, BookOpen, BrainCircuit, Database, Gamepad2, Mic, Presentation, Sparkles, Youtube, Hash, Code, Rocket, Heart } from 'lucide-react';
import Footer from '@/components/shared/footer';
import PublicHeader from '@/components/shared/public-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <Card className="bg-card border border-border/50 transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-primary/10 card-glow h-full">
        <CardHeader className="flex-row items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
                {icon}
            </div>
            <CardTitle className="font-headline text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);


export default function DocsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <PublicHeader />
            <main className="flex-grow container mx-auto px-4 py-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <h1 className="text-5xl md:text-7xl font-bold font-headline text-foreground mb-4 leading-tight">
                        Taleem AI
                        <span className="highlight-gradient"> Documentation</span>
                    </h1>
                    <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
                        A complete guide to your personal AI tutor. Learn how to leverage every feature to maximize your learning potential.
                    </p>
                </motion.div>

                <Separator className="my-12" />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sticky Sidebar */}
                    <aside className="hidden lg:block lg:col-span-1 sticky top-32 h-fit">
                        <nav className="flex flex-col gap-2">
                             <a href="#introduction" className="font-semibold text-primary">Introduction</a>
                             <a href="#our-story" className="font-semibold text-primary">Our Story & Tech</a>
                             <a href="#core-features" className="font-semibold text-primary pl-2">Core Features</a>
                             <a href="#key-innovations" className="font-semibold text-primary pl-2">Key Innovations</a>
                             <ul className="flex flex-col gap-1 pl-6 text-sm text-muted-foreground">
                                <li><a href="#innovation-rag" className="hover:text-foreground">Curriculum-Grounded RAG</a></li>
                                <li><a href="#innovation-voice" className="hover:text-foreground">Voice-First Interface</a></li>
                             </ul>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <div className="lg:col-span-3 prose prose-lg dark:prose-invert max-w-none">
                        
                        <section id="introduction">
                            <h2 className="text-4xl font-headline font-bold flex items-center gap-3"><Hash /> Introduction: Bridging the Gap</h2>
                            <p>
                                In Pakistan's educational landscape, students often struggle to bridge the gap between rote memorization and true conceptual understanding. Taleem AI was created to tackle this challenge head-on.
                            </p>
                            <p>
                                We are not just another learning app; we are a personal AI tutor designed to be deeply relevant to the Pakistani student. Our platform transforms static study material into a dynamic, interactive, and personalized experience. We call it: <strong className="text-primary">"Learn Smarter, Speak Freely."</strong>
                            </p>
                        </section>

                        <Separator className="my-12" />

                         <section id="our-story">
                            <h2 className="text-4xl font-headline font-bold flex items-center gap-3"><Heart /> Our Story & Technology</h2>
                             <p>
                                Taleem AI is more than just code; it's a testament to passion and determination. Our journey in building this platform was fueled by a singular goal that went beyond just winning the hackathon: to become an active part of the Google Developer Group (GDG) Cloud community. 
                            </p>
                             <blockquote>
                                We are students from NUML, and for the past three years, we've actively sought out Google and Cloud events at other universities like Bahria, FAST, and Air University, because our own university's GDG chapter has been dormant. Our participation in this hackathon is our way of knocking on the community's door, showcasing our skills and our eagerness to contribute.
                            </blockquote>
                            <h3 className="text-3xl font-headline flex items-center gap-3 mt-8"><Code /> Built Entirely in Firebase Studio</h3>
                             <p>
                                This entire, full-stack application, from the database to the AI models to the frontend, was built exclusively within <strong className="text-primary">Google Firebase Studio</strong>. We did not use any external AI coding assistants like Vercel v0, Cursory, or GitHub Copilot. Our process was a direct collaboration between our team's vision and the powerful, integrated capabilities of Firebase Studio.
                            </p>
                            <ul>
                                <li><strong>Rapid Scaffolding:</strong> Authentication, Firestore, and the entire Next.js framework were set up in minutes.</li>
                                <li><strong>Conversational Development:</strong> We generated entire React components, server actions, and complex AI flows by describing our needs to the Studio's AI.</li>
                                <li><strong>Unified Environment:</strong> This allowed us to build a large-scale, fully functional, and innovative application at a speed that would be unimaginable with traditional tools.</li>
                            </ul>
                            <p>
                                Taleem AI is our proof-of-concept, demonstrating not only a powerful new tool for education but also what a dedicated team can achieve with the right platform.
                            </p>
                        </section>

                        <Separator className="my-12" />

                        <section id="core-features">
                            <h2 className="text-4xl font-headline font-bold flex items-center gap-3"><Sparkles /> Core Features</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose my-8">
                                <FeatureCard 
                                    icon={<BrainCircuit className="w-8 h-8" />}
                                    title="Personalized Dashboard"
                                    description="A motivational command center for your learning journey, with stats on levels, points, streaks, and subject performance."
                                />
                                <FeatureCard 
                                    icon={<Award className="w-8 h-8" />}
                                    title="Gamified Experience"
                                    description="To combat study fatigue, we've integrated a robust system of daily challenges, achievements, and leveling to make learning fun and rewarding."
                                />
                                <FeatureCard 
                                    icon={<BookOpen className="w-8 h-8" />}
                                    title="The Smart Study Suite"
                                    description="Upload any document and instantly generate AI Notes with diagrams, Quizzes, Flashcards, Presentations, and Past Paper Analysis."
                                />
                                <FeatureCard 
                                    icon={<Gamepad2 className="w-8 h-8" />}
                                    title="Educational Games"
                                    description="Reinforce learning through play with our dedicated Games Center, featuring titles like 'Map Master' and 'Subject Sprint'."
                                />
                            </div>
                        </section>

                        <Separator className="my-12" />
                        
                        <section id="key-innovations">
                             <h2 className="text-4xl font-headline font-bold flex items-center gap-3"><Rocket /> Key Innovations</h2>
                             <div id="innovation-rag" className="mt-8">
                                <h3 className="text-3xl font-headline flex items-center gap-3"><Database /> Curriculum-Grounded RAG</h3>
                                <p>
                                    Generic LLMs lack specific curricular context. We solved this by architecting a sophisticated <strong className="text-primary">Retrieval-Augmented Generation (RAG)</strong> system. Our AI's knowledge base is built directly from official Pakistani curriculum textbooks and user-uploaded materials. When you ask a question, our system first retrieves relevant passages from your documents and then synthesizes a precise, context-aware answer.
                                </p>
                             </div>
                             <div id="innovation-voice" className="mt-8">
                                <h3 className="text-3xl font-headline flex items-center gap-3"><Mic /> Voice-First, Bilingual Interface</h3>
                                 <p>
                                    To make the platform truly accessible, Taleem AI features a seamless, voice-first interface. Students can ask questions, navigate, and receive answers by speaking naturally in both <strong className="text-primary">English and Urdu</strong>. This makes advanced technology feel intuitive and inclusive for every student.
                                 </p>
                             </div>
                        </section>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
