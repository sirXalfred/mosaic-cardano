import React from 'react';
import { AlertCircleIcon } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="size-full flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-theme-surface-high rounded-full flex items-center justify-center mb-6 border border-theme-outline/20 shadow-sm">
                <AlertCircleIcon className="text-theme-accent" size={32} />
            </div>
            <h1 className="font-serif text-3xl font-medium text-theme-forest mb-2">{404}</h1>
            <p className="text-theme-on-surface/60 max-w-md font-sans leading-relaxed">
                The page you are looking for doesn&apos;t exist or has been moved.
            </p>
        </div>
    );
}
