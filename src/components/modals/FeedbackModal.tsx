"use client";

import React, { useState } from 'react';
import { CloseButton } from '../ui/close-button';
import { useSubmitFeedback } from '@/services/feedback';
import { Loader2, MessageSquare, Wallet, ArrowLeft } from 'lucide-react';
import QRCode from 'react-qr-code';
import { InteractiveCopy } from '../ui/interactive-copy';
import { Button } from '../ui/button';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [view, setView] = useState<'feedback' | 'support'>('feedback');
  const [type, setType] = useState('General');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const { mutateAsync: submitFeedback, isPending } = useSubmitFeedback();

  const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || 'addr_test1...';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    try {
      await submitFeedback({ 
        type, 
        message,
        name: isAnonymous ? undefined : name,
        email: isAnonymous ? undefined : email
      });
      setMessage('');
      setName('');
      setEmail('');
      onClose();
    } catch (error) {
      console.error("Feedback submission failed", error);
    }
  };

  const handleClose = () => {
    setView('feedback');
    setMessage('');
    onClose();
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-parchment/40 backdrop-blur-sm">
      
  
      <div className="relative bg-theme-parchment w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
          <CloseButton disabled={isPending} onClick={handleClose} />

        <div className="px-6 py-4 border-b border-theme-outline/20 flex justify-between items-center bg-theme-surface-low">
          {view === 'support' ? (
            <Button 
              variant="link"
              size="none"
              onClick={() => setView('feedback')}
            >
              <ArrowLeft size={18} /> Support Project
            </Button>
          ) : (
            <h2 className="font-serif text-xl font-medium text-theme-forest flex items-center gap-2">
              <MessageSquare size={18} /> Support & Feedback
            </h2>
          )}
        </div>

        {view === 'feedback' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-theme-forest">
                Feedback Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={isPending}
                className="w-full bg-white border border-theme-outline/20 rounded-xl px-4 py-3 text-sm text-theme-forest focus:outline-none focus:ring-2 focus:ring-theme-accent/50 transition-all"
              >
                <option value="General">General</option>
                <option value="Bug">Bug Report</option>
                <option value="Feature">Feature Request</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 accent-theme-accent cursor-pointer"
              />
              <label htmlFor="anonymous" className="text-xs font-bold uppercase tracking-widest text-theme-forest cursor-pointer select-none">
                Stay anonymous
              </label>
            </div>

            {!isAnonymous && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-theme-forest">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isPending}
                    className="w-full bg-white border border-theme-outline/20 rounded-xl px-4 py-3 text-sm text-theme-forest focus:outline-none focus:ring-2 focus:ring-theme-accent/50 transition-all placeholder:text-theme-on-surface/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-theme-forest">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isPending}
                    className="w-full bg-white border border-theme-outline/20 rounded-xl px-4 py-3 text-sm text-theme-forest focus:outline-none focus:ring-2 focus:ring-theme-accent/50 transition-all placeholder:text-theme-on-surface/30"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-theme-forest">
                Message
              </label>
              <textarea
                placeholder="Tell us what you think..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isPending}
                required
                className="w-full bg-white border border-theme-outline/20 rounded-xl px-4 py-3 text-sm text-theme-forest focus:outline-none focus:ring-2 focus:ring-theme-accent/50 transition-all min-h-[120px] resize-none placeholder:text-theme-on-surface/30"
              />
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-theme-outline/10">
              <Button
                variant="link"
                size="none"
                onClick={() => setView('support')}
              >
                <Wallet size={14} /> Or support this project
              </Button>

              <Button
                disabled={isPending || !message}
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                {isPending ? 'Sending...' : 'Send Feedback'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-6 flex flex-col items-center space-y-6">
            <p className="text-sm text-theme-forest/80 text-center font-serif">
              Mosaic is an open-source initiative. Your support helps us keep the infrastructure running and the platform growing.
            </p>
            
            <div className="p-4 bg-white rounded-xl shadow-inner border border-theme-outline/10">
              <QRCode 
                value={treasuryAddress} 
                size={200}
                level="M"
              />
            </div>

            <div className="w-full space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-theme-forest text-center block">
                Treasury Address (Cardano)
              </label>
              <div className="flex items-center gap-3 w-full bg-theme-surface-low border border-theme-outline/20 rounded-xl px-4 py-3">
                <span className="text-xs font-mono text-theme-forest truncate flex-1 select-all">
                  {treasuryAddress}
                </span>
                <InteractiveCopy textToCopy={treasuryAddress} iconSize={16} className="text-theme-forest hover:text-theme-accent" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
