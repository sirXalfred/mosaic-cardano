"use client";

import { useEffect } from 'react';
import { useGetAuthState } from '@/services/auth';
import { useModals } from '@/contexts/modals-context';
import { MODALS } from '@/lib/modals';
import { AppIntent, INTENT_KEY, processPendingInvite } from '@/lib/intents';

export const ParseIntent = () => {
  const { data: authState } = useGetAuthState();
  const { openModal } = useModals();

  useEffect(() => {
    if (!authState?.isAuthenticated) return;

    const intent = localStorage.getItem(INTENT_KEY) as AppIntent;
    
    if (intent) {
      if (intent === AppIntent.PRICING_VIEW) {
        openModal(MODALS.PRICING);
        localStorage.removeItem(INTENT_KEY);
        
      } else if (intent === AppIntent.INVITE_VILLAGE) {
        processPendingInvite();
      }
    }
  }, [authState?.isAuthenticated, openModal]);

  return null;
};