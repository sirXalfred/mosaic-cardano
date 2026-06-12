"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, ArrowLeft, Key, Check, X, Loader2 } from 'lucide-react';
import { PERKS, MOSAIC_EASE } from '../lib/data';
import { Button } from './ui/button';
import { FormError } from './ui/form-error';
import Link from 'next/link';
import { DecorativeGrid } from './ui/decorative-grid';
import MosaicBrand from './ui/icons/MosaicBrand';
import { useLogin, useRegister, useUsernameCheck } from '@/services/auth';
import { ROUTES } from '@/lib/routes';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  username: string;
}

const initialData = {
  email: '',
  password: '',
  name: '',
  username: '',
}

export default function AuthView() {
  const [perkIndex, setPerkIndex] = useState(0);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const router = useRouter();

  const [formData, setFormData] = useState<AuthFormData>(initialData);
  const debouncedUsername = useDebounce(formData.username, 500);
  const { available: isUsernameValid, error: usernameCheckError, isLoading: isLoadingUsername } = useUsernameCheck(debouncedUsername, mode === 'signup');
  const usernameError = usernameCheckError?.message;

  const logUserIn = useLogin();
  const registerUser = useRegister();

  const [isLoading, isError, error, isSuccessful] = mode === 'signin' ? [logUserIn.isPending, logUserIn.isError, logUserIn.error, logUserIn.isSuccess] : [registerUser.isPending, registerUser.isError, registerUser.error, registerUser.isSuccess];

  useEffect(() => {
    const timer = setInterval(() => setPerkIndex(p => (p + 1) % PERKS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const processPendingInvite = async () => {
    try {
      const stored = localStorage.getItem('pendingInvite');
      if (stored) {
        const { hash } = JSON.parse(stored);
        if (hash) {
          await fetch(`/api/invites/${hash}/accept`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          localStorage.removeItem('pendingInvite');
        }
      }
    } catch (err) {
      console.error('Error processing pending invite:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    try {
      if (mode === 'signup') {
        await registerUser.mutateAsync({
          username: formData.username,
          displayName: String(formData.name || 'Mosaic User'),
          email: formData.email,
          password: formData.password,
        });

        await processPendingInvite();
        router.push(ROUTES.ONBOARDING);

      } else {
        await logUserIn.mutateAsync({ email: formData.email, password: formData.password });

        await processPendingInvite();
        router.push(ROUTES.HOME);
      }

    } catch {
      // do sumn
    }
  }

  return (
    <div className="min-h-screen flex w-full relative z-20">

      {/* Left Column - Graphic/Info */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-theme-forest text-theme-parchment flex-col justify-center px-24">

        <DecorativeGrid />

        {/* Back Button */}
        <Link href="/" className="absolute top-12 left-12 flex items-center gap-2 text-theme-parchment/60 hover:text-theme-parchment transition-colors text-xs font-bold uppercase tracking-widest z-50">
          <ArrowLeft size={16} /> Return Home
        </Link>

        <AnimatePresence mode="wait">
          <motion.div key={perkIndex} initial={{ rotateX: 90, opacity: 0, filter: 'blur(10px)' }} animate={{ rotateX: 0, opacity: 1, filter: 'blur(0px)' }} exit={{ rotateX: -90, opacity: 0, filter: 'blur(10px)' }} transition={{ duration: 1.2, ease: MOSAIC_EASE }} className="relative z-10">
            <h3 className="font-serif text-5xl mb-6 italic">{PERKS[perkIndex].title}</h3>
            <p className="text-xl opacity-60 max-w-md leading-relaxed">{PERKS[perkIndex].desc}</p>
            <div className="w-12 h-1 mt-10 rounded-full transition-colors duration-1000 bg-theme-clay" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-12 left-24 flex gap-2">
          {PERKS.map((_, i) => (<div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === perkIndex ? 'w-8 bg-theme-clay' : 'w-2 bg-theme-parchment/20'}`} />))}
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-24 relative">
        {/* Mobile Back Button */}
        <Link href="/" className="lg:hidden absolute top-8 left-6 flex items-center gap-2 text-theme-forest/60 hover:text-theme-forest transition-colors text-xs font-bold uppercase tracking-widest z-50">
          <ArrowLeft size={16} /> Home
        </Link>

        <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }} transition={{ duration: 1, ease: MOSAIC_EASE }} className="max-w-md w-full mx-auto">

          <div className="mb-12 space-y-6">
            <MosaicBrand />


            <h2 className="font-serif text-4xl mb-2 text-theme-forest">
              {mode === 'signup' ? 'Create an Account.' : 'Welcome back.'}
            </h2>
            <p className="text-theme-on-surface/60">
              {mode === 'signup' ? 'Join the network of creative villages.' : 'Sign in to access your artifacts.'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-theme-on-surface/60">Display Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-on-surface/40" />
                    <input required name="name" type="text" placeholder="David Artisan" className="w-full bg-theme-surface-high border border-theme-outline/20 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-theme-forest transition-all text-theme-forest placeholder:text-theme-on-surface/30 shadow-sm"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-theme-on-surface/60 flex justify-between">
                    <span>Username</span>
                    {usernameError && <span className="text-red-500 font-normal normal-case">{usernameError}</span>}
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-on-surface/40" />
                    <input key='username' required name="username" type="text" placeholder="david_artisan" className="w-full bg-theme-surface-high border border-theme-outline/20 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-theme-forest transition-all text-theme-forest placeholder:text-theme-on-surface/30 shadow-sm"
                      onChange={handleInputChange} value={formData.username}
                    />
                    {isLoadingUsername && (
                      <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-on-surface/40 animate-spin" />
                    )}
                    {!isLoadingUsername && isUsernameValid && formData.username && (
                      <Check size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
                    )}
                    {!isLoadingUsername && usernameError && formData.username && (
                      <X size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-theme-on-surface/60">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-on-surface/40" />
                <input required name="email" type="email" placeholder="david@mosaic.so" className="w-full bg-theme-surface-high border border-theme-outline/20 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-theme-forest transition-all text-theme-forest placeholder:text-theme-on-surface/30 shadow-sm"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-theme-on-surface/60">Password</label>
              <div className="relative">
                <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-on-surface/40" />
                <input required name="password" type="password" placeholder="••••••••" className="w-full bg-theme-surface-high border border-theme-outline/20 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-theme-forest transition-all text-theme-forest placeholder:text-theme-on-surface/30 shadow-sm"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <FormError message={isError ? error?.message || "An unknown error occurred" : ''} />

            <Button className='w-full shadow-xl' type="submit" isLoading={isLoading || isSuccessful} size="lg" disabled={isSuccessful || (mode === 'signup' && (!isUsernameValid || isLoadingUsername))}>
              {mode === 'signup' ? 'Join the Village' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Button variant="link"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-xs font-bold uppercase"
            >
              {mode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }
}