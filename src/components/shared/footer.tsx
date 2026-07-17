
import { Github, Twitter, Linkedin } from 'lucide-react';
import Logo from './logo';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <Link href="/" className="flex justify-center md:justify-start items-center gap-4">
                <Logo />
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">© {new Date().getFullYear()} Taleem AI. All rights reserved.</p>
          </div>
           <div className="flex items-center gap-4">
             <Link href="/parent/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Parent Portal
            </Link>
            <div className="flex space-x-4">
              <Link href="https://x.com/codewithsalty" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Twitter size={20} />
              </Link>
              <Link href="https://github.com/S4lmankhan" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Github size={20} />
              </Link>
              <Link href="https://www.linkedin.com/in/s4lmankhan/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Linkedin size={20} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
