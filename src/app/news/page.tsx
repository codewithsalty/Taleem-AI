
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import PublicHeader from '@/components/shared/public-header';
import Footer from '@/components/shared/footer';

const teamMembers = [
    {
        name: "Salman Khan",
        role: "Full Stack AI Engineer | Certified Ethical Hacker",
        avatar: "https://i.postimg.cc/TYWcbYbc/salman.jpg",
        description: "Specializing in intelligent systems development using LLMs, RAG pipelines, MCPs, and autonomous AI agents. Deep expertise in AI-driven application architecture and cybersecurity.",
        socials: {
            github: "https://github.com/codewithsalty",
            linkedin: "https://www.linkedin.com/in/s4lmankhan/",
            twitter: "https://x.com/codewithsalty",
        }
    },
    {
        name: "Hina Tanveer",
        role: "AI & ML Engineer | Data Analyst",
        avatar: "https://i.postimg.cc/6pP2fdNT/dae9e46a-23a8-42b4-91fa-effb14a2b906-copied-media-2.jpg",
        description: "Building intelligent data-driven systems with expertise in machine learning, automation, and data analytics. Creating visually compelling and insight-rich AI solutions.",
        socials: {
            github: "https://github.com/HinaTanveer813",
            linkedin: "https://www.linkedin.com/in/hinatanveer3810/",
            twitter: "#",
        }
    },
    {
        name: "Usama Shahid",
        role: "AI Engineer | Deep Learning & NLP Specialist",
        avatar: "https://i.postimg.cc/9fSd06MX/Whats-App-Image-2025-07-18-at-18-48-12-b406fa92.jpg",
        description: "Developing production-grade AI systems in deep learning, natural language processing, and computer vision. Transforming complex problems into scalable intelligent solutions.",
        socials: {
            github: "https://github.com/fewgets",
            linkedin: "https://www.linkedin.com/in/-usamashahid/",
            twitter: "#",
        }
    }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
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

const SocialLink = ({ href, icon: Icon }: { href: string; icon: React.ElementType }) => {
    if (href === "#") return null;
    return (
        <Button variant="ghost" size="icon" asChild>
            <Link href={href} target="_blank" rel="noopener noreferrer">
                <Icon className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
        </Button>
    )
};

export default function TeamPage() {
    return (
         <div className="flex flex-col min-h-screen bg-background text-foreground">
            <PublicHeader />
            <main className="flex-grow">
                <section className="relative w-full pt-28 pb-16 md:pt-40 md:pb-24 overflow-hidden">
                    <div className="absolute inset-0 -z-10 h-full w-full bg-background gradient-mesh-background"/>
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        >
                        <h1 className="text-5xl md:text-7xl font-bold font-headline text-foreground mb-4 leading-tight">
                            Meet the 
                            <span className="highlight-gradient"> Team</span>
                        </h1>
                        <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
                            The team behind Taleem AI — engineers, developers, and AI specialists building the future of education through intelligent systems.
                        </p>
                        </motion.div>
                    </div>
                </section>
                
                <section className="container mx-auto py-12 px-4">
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {teamMembers.map((member) => (
                            <motion.div
                                key={member.name}
                                variants={itemVariants}
                                whileHover={{ scale: 1.05, y: -8 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <Card className="flex flex-col h-full text-center shadow-lg hover:shadow-primary/20 card-glow transition-shadow duration-300">
                                    <CardHeader className="items-center">
                                        <Avatar className="w-32 h-32 mb-4 border-4 border-primary/50">
                                            <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="person portrait" className="object-cover" />
                                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <CardTitle className="font-headline text-2xl">{member.name}</CardTitle>
                                        <CardDescription className="text-primary font-semibold">{member.role}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p className="text-muted-foreground">{member.description}</p>
                                    </CardContent>
                                    <CardFooter className="justify-center">
                                        <div className="flex gap-2">
                                            <SocialLink href={member.socials.github} icon={Github} />
                                            <SocialLink href={member.socials.linkedin} icon={Linkedin} />
                                            <SocialLink href={member.socials.twitter} icon={Twitter} />
                                        </div>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
