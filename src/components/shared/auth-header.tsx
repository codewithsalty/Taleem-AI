
'use client';

import Link from 'next/link';
import Logo from './logo';
import { ThemeToggle } from './theme-toggle';

export default function AuthHeader() {
  return (
    <header className="absolute top-0 z-50 w-full">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" aria-label="Taleem AI Home">
          <Logo />
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
