"use client";

import React, { useState } from 'react';
import { useWallet } from '@meshsdk/react';
import { useSignContribution } from '@/services/documents';
import { useModals } from '@/contexts/modals-context';
import { MODALS } from '@/lib/modals';
import { Loader2, PenTool } from 'lucide-react';

interface SignContributionButtonProps {
  documentId: string;
  weight: number;
  className?: string;
}

export function SignContributionButton({ documentId, weight, className = '' }: SignContributionButtonProps) {
  const { connected, wallet } = useWallet();
  const { openModal } = useModals();
  const { mutateAsync: signContribution, isPending: isSigningAPI } = useSignContribution();
  const [isWalletSigning, setIsWalletSigning] = useState(false);


  const isWorking = isSigningAPI || isWalletSigning;

  const handleSign = async () => {
    if (!connected || !wallet) {
      openModal(MODALS.WALLET_CONNECT);
      return;
    }

    try {
      setIsWalletSigning(true);
      
      const addresses = await wallet.getUsedAddresses();
      const address = addresses[0] || await wallet.getChangeAddress();


      // Payload to sign
      const payload = `I agree to my ${weight}% contribution weight for document: ${documentId}`;
      
      const signature = await wallet.signData(payload, address);
      
      // Submit signature and wallet address to backend
      await signContribution({
        documentId,
        signatureHash: signature.signature,
        walletAddress: address
      });
      
    } catch (error) {
      console.error("Failed to sign:", error);
    } finally {
      setIsWalletSigning(false);
    }
  };

  return (
    <button
      onClick={handleSign}
      disabled={isWorking}
      className={`bg-theme-accent text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-theme-accent/90 shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isWorking ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <PenTool size={14} />
      )}
      {connected ? 'Sign Contribution' : 'Connect to Sign'}
    </button>
  );
}
