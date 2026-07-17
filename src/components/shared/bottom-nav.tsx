
'use client';

import Link from 'next/link';
import { Home, Bot, BrainCircuit, Mic, Gamepad2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/ai-tutor', icon: Bot, label: 'Tutor' },
  { href: '/games', icon: Gamepad2, label: 'Games' },
  { href: '/quiz-generator', icon: BrainCircuit, label: 'Quizzes' },
  { href: '/voice-tutor', icon: Mic, label: 'Speak' },
];

const NavItem = ({ href, icon: Icon, label, isActive }: { href: string; icon: React.ElementType; label: string; isActive: boolean }) => {
  return (
    <Link href={href} className="flex-1">
      <motion.div
        className="flex flex-col items-center gap-1 text-xs transition-colors text-muted-foreground hover:text-primary active:scale-95"
        animate={{ color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
      >
        <Icon className="h-5 w-5" />
        <AnimatePresence>
          {isActive && (
            <motion.span
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
};

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-t z-50">
      <nav className="flex items-center justify-around h-full">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} isActive={pathname.startsWith(item.href)} />
        ))}
      </nav>
    </div>
  );
}
