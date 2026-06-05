import React from 'react';
import { AlertTriangleIcon, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export type PageErrorProps = {
  title?: string;
  description?: string;
  errorMessage?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
};

export function PageError({
  title = "Something went wrong",
  description = "An unexpected error occurred while loading this page.",
  errorMessage,
  onRetry,
  showHomeButton = true
}: PageErrorProps) {
  const router = useRouter();

  return (
    <div className="flex w-full min-h-[60vh] flex-col items-center justify-center p-6 md:p-10 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-red-500/5 dark:bg-red-400/5 mb-8">
        <div className="absolute inset-0 rounded-full border border-red-500/10 dark:border-red-300/10" />
        <div className="absolute inset-5 rounded-[2rem] bg-theme-surface/70 dark:bg-black/20 border border-red-500/10 dark:border-red-300/10 rotate-[-6deg]" />
        <AlertTriangleIcon className="relative z-10 text-red-600/80 dark:text-red-400/80" size={42} strokeWidth={1.8} />
      </div>

      <div className="max-w-lg space-y-4">
        <h3 className="font-serif text-3xl font-medium text-theme-forest">{title}</h3>
        
        <p className="font-sans text-theme-on-surface/70 leading-relaxed text-lg">
          {description}
        </p>

        {errorMessage && (
          <div className="mx-auto mt-6 max-w-full rounded-xl bg-red-50/50 p-4 border border-red-100/50 text-left overflow-hidden">
            <p className="font-mono text-xs text-red-800 break-words line-clamp-3">{errorMessage}</p>
          </div>
        )}

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          {onRetry && (
            <Button onClick={onRetry} variant="default" className="rounded-full px-8 py-5 w-full sm:w-auto shadow-md">
              <RotateCcw size={18} className="mr-2" />
              Try Again
            </Button>
          )}
          {showHomeButton && (
            <Button onClick={() => router.push('/')} variant="outline" className="rounded-full px-8 py-5 w-full sm:w-auto bg-transparent border-theme-outline/20">
              <Home size={18} className="mr-2" />
              Return Home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
