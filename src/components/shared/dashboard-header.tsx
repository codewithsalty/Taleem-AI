
'use client'

import Link from 'next/link'
import {
  Home,
  PanelLeft,
  Search,
  MessageCircle,
  Mic,
  Database,
  Settings,
  Sparkles,
  Map,
  NotebookPen,
  Gamepad2,
  Presentation,
  ClipboardCopy,
  Youtube,
  Newspaper,
  Users,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from '@/components/ui/sheet'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Logo from './logo'
import { BrainCircuit, Bot } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import LanguageToggle from './language-toggle'
import { ThemeToggle } from './theme-toggle'
import UserNav from './user-nav'
import { useTranslation } from '@/hooks/use-translation'

const NavLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => {
    const pathname = usePathname();
    const isActive = pathname.startsWith(href);
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-4 px-2.5",
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label={label}
        >
            <Icon className="h-5 w-5" />
            {label}
        </Link>
    );
}

export default function DashboardHeader() {
  const { t } = useTranslation();

  const navLinks = [
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
      { href: "/youtube-summarizer", icon: Youtube, label: "YouTube Summarizer" },
      { href: "/settings", icon: Settings, label: t('settings') },
  ]

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="md:hidden" aria-label="Toggle Menu">
            <PanelLeft className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 text-lg font-semibold is-open"
              aria-label="Taleem AI Home"
            >
              <Logo />
            </Link>
            {navLinks.map(link => <NavLink key={link.href} {...link} />)}
          </nav>
        </SheetContent>
      </Sheet>
      
      <div className="relative ml-auto flex items-center gap-4 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t('search')}
          className="w-32 sm:w-48 md:w-[200px] lg:w-[320px] rounded-lg bg-background pl-8 h-9 text-sm"
          aria-label="Search"
        />
      </div>
      <LanguageToggle />
      <ThemeToggle />
      <UserNav />
    </header>
  )
}
