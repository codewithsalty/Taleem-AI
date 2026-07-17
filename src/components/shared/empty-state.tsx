
'use client';

import { Button } from "@/components/ui/button"
import Link from "next/link"

type EmptyStateProps = {
    title: string;
    description: string;
    ctaText?: string;
    ctaLink?: string;
    onCtaClick?: () => void;
}

export default function EmptyState({title, description, ctaText, ctaLink, onCtaClick}: EmptyStateProps) {
    
    const CtaButton = () => {
        if (!ctaText) return null;

        if (ctaLink) {
            return (
                <Button asChild>
                    <Link href={ctaLink}>{ctaText}</Link>
                </Button>
            );
        }
        if (onCtaClick) {
            return <Button onClick={onCtaClick}>{ctaText}</Button>;
        }
        return null;
    };

    return (
        <div className="flex flex-col items-center justify-center text-center p-8 h-full">
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <p className="text-muted-foreground mb-4 text-sm">{description}</p>
            <CtaButton />
        </div>
    )
};
