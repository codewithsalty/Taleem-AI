
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/components/shared/theme-provider';
import SplashScreen from '@/components/shared/splash-screen';
import { AnimatePresence } from 'framer-motion';
import { Inter, Poppins, Noto_Nastaliq_Urdu } from 'next/font/google';
import { cn } from '@/lib/utils';
import { LanguageProvider } from '@/context/language-context';
import { TooltipProvider } from '@/components/ui/tooltip';

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Poppins({
  subsets: ['latin'],
  weight: '700',
  variable: '--font-headline',
});

const fontUrdu = Noto_Nastaliq_Urdu({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-urdu',
});


export const metadata: Metadata = {
  title: 'Taleem AI',
  description: 'A voice-first, RAG-powered, offline-capable educational platform for Pakistani students.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-body antialiased", fontBody.variable, fontHeadline.variable, fontUrdu.variable)} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <TooltipProvider delayDuration={0}>
              <FirebaseClientProvider>
                <AnimatePresence mode="wait">
                  <SplashScreen />
                </AnimatePresence>
                {children}
              </FirebaseClientProvider>
              <Toaster />
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
