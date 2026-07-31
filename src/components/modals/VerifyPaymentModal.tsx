import React, { useState } from 'react';
import { Loader2, Clock } from 'lucide-react';
import { useVerifyPayment } from '@/services/payments';
import { CloseButton } from '../ui/close-button';
import { useUserEventsStream } from '@/hooks/useUserEventsStream';

interface VerifyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VerifyPaymentModal({ isOpen, onClose }: VerifyPaymentModalProps) {
  const [txHash, setTxHash] = useState('');
  const [planType, setPlanType] = useState('PRO');
  const { mutateAsync: verifyPayment, isPending } = useVerifyPayment();
  const [queued, setQueued] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useUserEventsStream(isOpen);

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (!txHash.trim()) return;
    setErrorMsg('');
    try {
      await verifyPayment({ txHash: txHash.trim(), planType });
      setQueued(true);
      setTimeout(() => {
        setQueued(false);
        setTxHash('');
        onClose();
      }, 3500);
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
          If you already paid on Cardano but closed the window, paste your transaction hash below to confirm your plan upgrade.
        </p>

        {queued ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-amber-600">
            <Clock size={48} className="mb-4 animate-pulse" />
            <p className="font-bold text-lg text-theme-forest">Verification Queued!</p>
            <p className="text-sm text-theme-on-surface/70 mt-1 max-w-xs">
              Our worker is confirming your transaction on the Cardano blockchain. You will receive an in-app notification as soon as it completes.
            </p>
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
