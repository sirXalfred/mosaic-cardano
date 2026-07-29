"use client";

import { useEffect } from 'react';
import { useGetAuthState } from '@/services/auth';
import { useModals } from '@/contexts/modals-context';
import { MODALS, ModalId } from '@/lib/modals';
import { AppIntent, INTENT_KEY, processPendingInvite } from '@/lib/intents';

export const useParseIntent = () => {
  const { data: authState } = useGetAuthState();
  const { openModal } = useModals();

  useEffect(() => {
    // 1. Check pending local storage intents when authenticated
    if (authState?.isAuthenticated) {
      const intent = localStorage.getItem(INTENT_KEY) as AppIntent;
      
      if (intent) {
        if (intent === AppIntent.PRICING_VIEW) {
          openModal(MODALS.PRICING);
          localStorage.removeItem(INTENT_KEY);
        } else if (intent === AppIntent.INVITE_VILLAGE) {
          processPendingInvite();
        }
      }
    }

    // 2. Safely parse URL query parameters for modal triggers: ?modal=MODAL_ID or ?modalId=MODAL_ID
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const modalParam = searchParams.get('modal') || searchParams.get('modalId');

      if (modalParam) {
        const modalKey = modalParam.toUpperCase();
        // Whitelist check: strictly compare against valid MODALS enum values
        const validModalId = Object.values(MODALS).find(id => id === modalKey) as ModalId | undefined;

        if (validModalId) {
          const payload: Record<string, string> = {};
          searchParams.forEach((value, key) => {
            if (key !== 'modal' && key !== 'modalId') {
              payload[key] = value;
            }
          });

          // Open validated modal
          openModal(validModalId, payload);

          // Clean up modal search query parameter from location bar to prevent re-opening on refresh
          searchParams.delete('modal');
          searchParams.delete('modalId');
          const newSearch = searchParams.toString();
          const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
          window.history.replaceState(null, '', newUrl);
        }
      }
    }
  }, [authState?.isAuthenticated, openModal]);
};