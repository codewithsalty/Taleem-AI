'use client';

import Link from 'next/link';
import { Home, Settings, Bot, BrainCircuit, MessageCircle, Mic, Database, Sparkles, Map, NotebookPen, Gamepad2, Presentation, ClipboardCopy, Youtube } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import Logo from './logo';

const NavLink = ({ href, icon: Icon, children, 'aria-label': ariaLabel }: { href: string; icon: React.ElementType; children: React.ReactNode; 'aria-label': string; }) => {
    const currentPath = usePathname();
    const isActive = currentPath.startsWith(href);
    return (
        <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
                <Link
                  href={href}
                  prefetch={true}
                  aria-label={ariaLabel}
                  className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 hover:bg-muted active:scale-95",
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                    <Icon className="h-5 w-5 pointer-events-none" />
                </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-semibold">{children}</TooltipContent>
        </Tooltip>
    );
};

export default function DashboardSidebar() {
    const { t } = useTranslation();

    const navItems = [
        { href: "/dashboard", icon: Home, label: t('dashboard') },
        { href: "/study-suite", icon: Sparkles, label: t('studySuite') },
        { href: "/notes-generator", icon: NotebookPen, label: "Notes Generator" },
        { href: "/quiz-generator", icon: Bot, label: t('quizGenerator') },
        { href: "/flashcards", icon: BrainCircuit, label: t('smartFlashcards') },
        { href: "/presentation-maker", icon: Presentation, label: "Presentation Maker" },
        { href: "/past-papers", icon: ClipboardCopy, label: "Past Paper Creator" },
        { href: "/games", icon: Gamepad2, label: t('gamesCenter') },
        { href: "/ai-tutor", icon: MessageCircle, label: t('aiTutor') },
        { href: "/voice-tutor", icon: Mic, label: t('voiceTutor') },
    ];
    
    return (
    <aside className="fixed left-0 top-0 bottom-0 z-50 hidden w-16 flex-col border-r bg-card/80 backdrop-blur-xl md:flex">
        <div className="flex flex-col items-center gap-4 py-6 h-full">
            <Link href="/dashboard" className="mb-6 transition-transform hover:scale-110" aria-label="Taleem AI Home">
                 <Logo className="h-8 w-8" />
            </Link>
            
            <nav className="flex flex-col items-center gap-3 flex-1 overflow-y-auto no-scrollbar py-2 px-3">
                {navItems.map(item => (
                    <NavLink key={item.href} href={item.href} icon={item.icon} aria-label={item.label}>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <nav className="flex flex-col items-center gap-3 pb-6 pt-4 border-t w-full px-3">
                <NavLink href="/youtube-summarizer" icon={Youtube} aria-label="YouTube Summarizer">YouTube Summarizer</NavLink>
                <NavLink href="/settings" icon={Settings} aria-label={t('settings')}>{t('settings')}</NavLink>
            </nav>
        </div>
    </aside>
    );
}
