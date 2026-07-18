import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import Logo from './logo';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <Link href="/" className="flex justify-center md:justify-start items-center gap-4">
                <Logo />
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-md">
              A voice-first, RAG-powered educational platform for Pakistani students. Learn Smarter, Speak Freely.
            </p>
          </div>
           <div className="flex flex-col items-center md:items-end gap-3">
             <div className="flex items-center gap-4">
               <Link href="/parent/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Parent Portal
              </Link>
              <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Docs
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link href="https://x.com/codewithsalty" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="X">
                <Twitter size={20} />
              </Link>
              <Link href="https://github.com/codewithsalty" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="GitHub">
                <Github size={20} />
              </Link>
              <Link href="https://www.linkedin.com/in/s4lmankhan/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="LinkedIn">
                <Linkedin size={20} />
              </Link>
              <Link href="mailto:codewithsalty@gmail.com" className="text-muted-foreground hover:text-foreground transition-colors" title="Email">
                <Mail size={20} />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Taleem AI. All rights reserved.</p>
           </div>
        </div>
      </div>
    </footer>
  );
}
