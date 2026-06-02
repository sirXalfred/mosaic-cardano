"use client";

import React from 'react';
import { FolderSearch2, RotateCcw, AlertTriangleIcon, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type StateVariant = 'loading' | 'empty' | 'error';

type StatePanelProps = {
  variant: StateVariant;
  title: string;
  description: string;
  className?: string;
  hasAction?: boolean;
  actionLabel?: string;
  onTriggerAction?: () => void;
  onRetry?: () => void;
  errorMessage?: string;
};

const Illustration = ({ variant }: { variant: StateVariant }) => {
  if (variant === 'loading') {
    return (
      <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-black/5 dark:bg-white/5">
        <div className="absolute inset-0 rounded-full border border-black/10 dark:border-white/10" />
        <Skeleton className="h-16 w-16 rounded-2xl bg-black/10 dark:bg-white/10" />
        <Skeleton className="absolute left-4 top-6 h-4 w-10 rounded-full bg-black/10 dark:bg-white/10" />
        <Skeleton className="absolute right-4 bottom-7 h-3 w-14 rounded-full bg-black/10 dark:bg-white/10" />
      </div>
    );
  }

  if (variant === 'error') {
    return (
      <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-red-500/10 dark:bg-red-400/10">
        <div className="absolute inset-0 rounded-full border border-red-500/20 dark:border-red-300/20" />
        <div className="absolute inset-5 rounded-[2rem] bg-white/70 dark:bg-black/20 border border-red-500/20 dark:border-red-300/20 rotate-[-6deg]" />
        <AlertTriangleIcon className="relative z-10 text-red-600 dark:text-red-300" size={42} strokeWidth={1.8} />
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-theme-forest/5 dark:bg-white/5">
      <div className="absolute inset-0 rounded-full border border-theme-forest/10 dark:border-white/10" />
      <div className="absolute left-6 top-7 h-16 w-16 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rotate-[-10deg]" />
      <div className="absolute right-6 bottom-7 h-14 w-14 rounded-3xl bg-theme-clay/10 border border-theme-clay/20 rotate-[8deg]" />
      <FolderSearch2 className="relative z-10 text-theme-forest/80 dark:text-white/80" size={44} strokeWidth={1.7} />
    </div>
  );
};

export function StatePanel({
  variant,
  title,
  description,
  className,
  hasAction = false,
  actionLabel = 'Create',
  onTriggerAction,
  onRetry,
  errorMessage,
}: StatePanelProps) {
  const isError = variant === 'error';
  const showAction = variant === 'empty' && hasAction && onTriggerAction;

  return (
    <div
      className={cn(
        'w-full min-h-[320px] rounded-3xl border border-black/5 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] px-6 py-8 md:px-10 md:py-12 flex items-center justify-center',
        className,
      )}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
    >
      <div className="w-full max-w-2xl text-center space-y-6">
        <Illustration variant={variant} />

        <div className="space-y-3">
          <h3 className="font-serif text-2xl md:text-3xl text-theme-forest dark:text-white leading-tight">
            {title}
          </h3>
          <p className="text-sm md:text-base text-theme-on-surface/70 dark:text-white/70 max-w-xl mx-auto leading-relaxed">
            {isError && errorMessage ? errorMessage : description}
          </p>
        </div>

        {variant === 'loading' ? (
          <div className="grid gap-3 max-w-xl mx-auto">
            <Skeleton className="h-4 w-5/6 mx-auto rounded-full bg-black/10 dark:bg-white/10" />
            <Skeleton className="h-4 w-2/3 mx-auto rounded-full bg-black/10 dark:bg-white/10" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Skeleton className="h-24 rounded-2xl bg-black/10 dark:bg-white/10" />
              <Skeleton className="h-24 rounded-2xl bg-black/10 dark:bg-white/10" />
            </div>
            <Skeleton className="h-11 w-36 mx-auto rounded-full bg-black/10 dark:bg-white/10 mt-2" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 pt-2">
            {showAction && (
              <Button onClick={onTriggerAction} variant="outline" size="sm" className="rounded-full px-5 py-2.5">
                <Plus size={16} />
                {actionLabel}
              </Button>
            )}

            {isError && onRetry && (
              <Button onClick={onRetry} variant="default" size="sm" className="rounded-full px-5 py-2.5">
                <RotateCcw size={16} />
                Retry
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export type { StateVariant };