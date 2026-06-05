import React from 'react';
import { AlertCircleIcon } from 'lucide-react';
import Footer from './Footer';
import Link from 'next/link';
import { Button } from '../ui/button';

export default function NotFound() {
    return (
        <div className="size-full flex-1 flex flex-col">
            <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6 p-6 text-center">
                <div className="w-20 h-20 bg-theme-surface-high rounded-full flex items-center justify-center border border-theme-outline/20 shadow-sm">
                    <AlertCircleIcon className="text-theme-accent" size={32} />
                </div>
                <div className="space-y-3">

                    <h1 className="font-serif text-3xl font-medium text-theme-forest">{404}</h1>
                    <p className="text-theme-on-surface/60 max-w-md font-sans leading-relaxed">
                        The page you are looking for doesn&apos;t exist or has been moved.
                    </p>
                    <Button asChild>
                        <Link
                            href="/"
                        >
                            Go to Homepage
                        </Link>
                    </Button>
                </div>
            </div>
            <Footer />
        </div>
    );
}
