
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';

const PakistanFlag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" className="w-6 h-auto rounded-sm">
        <rect fill="#fff" width="800" height="600"/>
        <rect fill="#006644" x="200" width="600" height="600"/>
        <circle fill="#fff" cx="550" cy="300" r="110"/>
        <circle fill="#006644" cx="580" cy="300" r="95"/>
        <path fill="#fff" d="m620 232 15 45-39-28 48 1-39 28z"/>
    </svg>
);

const UKFlag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 36" className="w-6 h-auto rounded-sm">
        <clipPath id="a"><path d="M0 0h60v36H0z"/></clipPath>
        <clipPath id="b"><path d="M30 18h30v18H30zm-30 0h30v18H0zM30 0h30v18H30zM0 0h30v18H0z"/></clipPath>
        <g clipPath="url(#a)">
            <path d="M0 0v36h60V0z" fill="#012169"/>
            <path d="M0 0L60 36M60 0L0 36" stroke="#fff" strokeWidth="6"/>
            <path d="M0 0L60 36M60 0L0 36" clipPath="url(#b)" stroke="#C8102E" strokeWidth="4"/>
            <path d="M30 0v36M0 18h60" stroke="#fff" strokeWidth="10"/>
            <path d="M30 0v36M0 18h60" stroke="#C8102E" strokeWidth="6"/>
        </g>
    </svg>
);


export default function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setLanguage('en')}
                className={cn("p-1.5 h-auto w-auto rounded-md transition-all", language === 'en' ? 'bg-primary/20' : 'opacity-50 hover:opacity-100')}
            >
                <div className="waving-flag">
                    <UKFlag />
                </div>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setLanguage('ur')}
                className={cn("p-1.5 h-auto w-auto rounded-md transition-all", language === 'ur' ? 'bg-primary/20' : 'opacity-50 hover:opacity-100')}
            >
                <div className="waving-flag">
                    <PakistanFlag />
                </div>
            </Button>
        </div>
    );
}
