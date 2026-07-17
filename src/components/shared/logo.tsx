import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  'aria-label'?: string;
};

export default function Logo({ className, 'aria-label': ariaLabel = "Taleem AI Home" }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2 group", className)} aria-label={ariaLabel}>
       <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
      >
        <rect width="32" height="32" rx="8" className="fill-primary"/>
        <path
          className="transition-transform duration-300 ease-out group-hover:animate-open-book"
          d="M9 23.5V8C9 7.44772 9.44772 7 10 7H24C24.5523 7 25 7.44772 25 8V23.5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transformOrigin: '25px 23.5px' }}
        />
        <path
          className="transition-transform duration-300 ease-out group-hover:animate-star-pulse"
          d="M9 23.5C9 24.3284 8.32843 25 7.5 25C6.67157 25 6 24.3284 6 23.5C6 22.6716 6.67157 22 7.5 22C8.32843 22 9 22.6716 9 23.5Z"
          fill="white"
          style={{ transformOrigin: '7.5px 23.5px' }}
        />
        <path d="M12 12H22" stroke="white" strokeWidth="2" strokeLinecap="round" className="logo-pages"/>
        <path d="M12 16H18" stroke="white" strokeWidth="2" strokeLinecap="round" className="logo-pages"/>
      </svg>
      <span className="hidden text-xl font-bold font-headline text-foreground md:group-[.is-open]:inline">
        Taleem AI
      </span>
    </div>
  );
}
