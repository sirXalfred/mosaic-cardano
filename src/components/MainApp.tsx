"use client";
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LandingView from './LandingView';
import AuthView from './AuthView';
import OnboardingView from './OnboardingView';
import ExploreView from './ExploreView';
import FilmGrain from './FilmGrain';

export default function MainApp() {
  const [view, setView] = useState<'landing'|'auth'|'onboarding'|'square'>('landing');

  return (
    <div className="min-h-screen bg-[#FFFBF5] relative selection:bg-amber-200/50">
      <FilmGrain />
      <AnimatePresence mode="wait">
        {view === 'landing' && <LandingView key="landing" onEnter={() => setView('auth')} />}
        {view === 'auth' && <AuthView key="auth" onAuthComplete={() => setView('onboarding')} />}
        {view === 'onboarding' && <OnboardingView key="onboarding" onComplete={() => setView('square')} />}
        {view === 'square' && <ExploreView key="square" />}
      </AnimatePresence>

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#4338CA]/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
    </div>
  );
}
