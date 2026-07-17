
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from './logo';
import { ThemeToggle } from './theme-toggle';
import { Search, Users } from 'lucide-react';

export default function PublicHeader() {
  return (
    <header className="absolute top-0 z-50 w-full">
      <div className="container flex h-24 items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-2 glassmorphic-nav p-2 rounded-full pulse-glow">
            <Link href="/" className="text-foreground/80 hover:text-foreground transition-all text-sm font-medium px-4 py-2 rounded-full hover:bg-primary/10">Home</Link>
            <Link href="/about" className="text-foreground/80 hover:text-foreground transition-all text-sm font-medium px-4 py-2 rounded-full hover:bg-primary/10">About</Link>
            <Link href="/news" className="text-foreground/80 hover:text-foreground transition-all text-sm font-medium px-4 py-2 rounded-full hover:bg-primary/10">Team</Link>
            <Link href="/docs" className="text-foreground/80 hover:text-foreground transition-all text-sm font-medium px-4 py-2 rounded-full hover:bg-primary/10">Documentation</Link>
            
            <div className="flex items-center gap-1">
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button className="primary-gradient text-white transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/40 hover:scale-105" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                  <ThemeToggle />
            </div>
          </nav>

          <div className="md:hidden flex items-center gap-2">
              <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
              </Button>
              <ThemeToggle />
          </div>
        </div>

      </div>
    </header>
  );
}
