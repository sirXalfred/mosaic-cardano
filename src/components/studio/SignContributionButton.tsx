"use client";

import React, { useState } from 'react';
import { useWallet } from '@meshsdk/react';
import { useSignContribution } from '@/services/documents';
import { useGetUserSettings } from '@/services/auth';
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

  const { data: userSettings } = useGetUserSettings();

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

      // Check if user has linked a wallet to their profile
      if (!userSettings?.walletAddress) {
        // We prompt them to link it, but we do not wait/block the signing process
        // We just pop the modal for them to link it for future recovery
        openModal(MODALS.PROMPT, {
          title: "Link Wallet for Recovery",
          description: "We noticed you haven't permanently linked a Cardano wallet to your profile. You can still sign this contribution, but linking your wallet ensures you never lose access to your on-chain reputation.",
          actionText: "Link Now",
          cancelText: "Skip for now",
          onAction: () => {
             // You can navigate to settings or trigger link wallet API
             // For now, they can just link via profile settings later
          }
        });
      }
      
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
