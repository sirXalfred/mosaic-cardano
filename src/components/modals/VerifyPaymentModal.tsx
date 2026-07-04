"use client";

import React, { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useVerifyPayment } from '@/services/payments';
import { CloseButton } from '../ui/close-button';

interface VerifyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VerifyPaymentModal({ isOpen, onClose }: VerifyPaymentModalProps) {
  const [txHash, setTxHash] = useState('');
  const [planType, setPlanType] = useState('PRO'); // Default or dropdown, but usually we know or they select
  const { mutateAsync: verifyPayment, isPending } = useVerifyPayment();
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (!txHash.trim()) return;
    setErrorMsg('');
    try {
      await verifyPayment({ txHash: txHash.trim(), planType });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setTxHash('');
        onClose();
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      setErrorMsg(error.response?.data?.error || error.message || 'Verification failed');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-theme-parchment/80 backdrop-blur-sm">
      <div className="bg-theme-surface w-full max-w-md rounded-3xl p-6 shadow-2xl border border-theme-outline/20 relative animate-in zoom-in-95 duration-200">
        <CloseButton onClick={onClose} />

        <h2 className="text-2xl font-serif text-theme-forest mb-2">Verify Payment</h2>
        <p className="text-sm text-theme-on-surface/60 mb-6">
          If you already paid but closed the window before it confirmed, paste your transaction hash below.
        </p>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-green-600">
            <CheckCircle2 size={48} className="mb-4" />
            <p className="font-bold text-lg">Payment Verified!</p>
            <p className="text-sm opacity-80">Your plan has been upgraded.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-theme-forest uppercase tracking-widest mb-1.5">Plan Type</label>
              <select 
                value={planType}
                onChange={e => setPlanType(e.target.value)}
                className="w-full bg-theme-surface-high border border-theme-outline/20 rounded-xl px-4 py-3 text-theme-forest focus:outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent"
              >
                <option value="BASIC">Basic ($8/mo)</option>
                <option value="PRO">Pro ($60/mo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-theme-forest uppercase tracking-widest mb-1.5">Transaction Hash</label>
              <input
                type="text"
                placeholder="e.g. 5d5a9...c4b2"
                value={txHash}
                onChange={e => setTxHash(e.target.value)}
                className="w-full bg-theme-surface-high border border-theme-outline/20 rounded-xl px-4 py-3 text-theme-forest placeholder:text-theme-on-surface/30 focus:outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent font-mono text-sm"
              />
            </div>

            {errorMsg && (
              <p className="text-sm text-red-500 font-bold">{errorMsg}</p>
            )}

            <button
              onClick={handleVerify}
              disabled={isPending || !txHash.trim()}
              className="w-full py-3 bg-theme-forest text-theme-parchment rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-theme-forest/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : 'Verify Transaction'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
