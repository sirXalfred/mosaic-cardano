"use client";

import React from 'react';
import { useModals } from '@/contexts/modals-context';
import { MODALS } from '@/lib/modals';
import CreateProjectModal from '../project/CreateProjectModal';
import PricingModal from '../modals/PricingModal';
import VerifyPaymentModal from '../modals/VerifyPaymentModal';
import { BadgesModal } from '../profile/BadgesModal';
import dynamic from 'next/dynamic';

const WalletConnectModal = dynamic(() => import('@/components/modals/WalletConnectModal'),
  { ssr: false }
);

export const ModalsContainer = () => {
  const { isOpen, closeModal } = useModals();

  return (
    <>
      <CreateProjectModal 
        isOpen={isOpen(MODALS.CREATE_PROJECT)} 
        onClose={() => closeModal(MODALS.CREATE_PROJECT)} 
      />
      <PricingModal
        isOpen={isOpen(MODALS.PRICING)}
        onClose={() => closeModal(MODALS.PRICING)}
      />
      {isOpen(MODALS.WALLET_CONNECT) && (
        <WalletConnectModal
          onClose={() => closeModal(MODALS.WALLET_CONNECT)}
        />
      )}
      <VerifyPaymentModal
        isOpen={isOpen(MODALS.VERIFY_PAYMENT)}
        onClose={() => closeModal(MODALS.VERIFY_PAYMENT)}
      />
      <BadgesModal />
    </>
  );
};
