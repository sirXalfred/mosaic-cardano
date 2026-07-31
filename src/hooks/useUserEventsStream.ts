'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { API } from '@/lib/api-routes';

function triggerConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}

export function useUserEventsStream(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    let eventSource: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let retryDelay = 3000;

    const connect = () => {
      eventSource = new EventSource(API.SERVER_EVENTS, { withCredentials: true });

      eventSource.onmessage = (event) => {
        retryDelay = 3000;
        try {
          const payload = JSON.parse(event.data);

          if (payload.event === 'badge_claimed') {
            queryClient.invalidateQueries({ queryKey: ['userBadges'] });
            toast.success(`Badge "${payload.badgeType || 'Badge'}" minted on-chain!`, {
              description: 'Your CIP-68 token is now confirmed on Cardano.',
            });
            triggerConfetti();
          } else if (payload.event === 'badge_mint_failed') {
            queryClient.invalidateQueries({ queryKey: ['userBadges'] });
            toast.error('Badge minting failed', {
              description: 'You can retry claiming your badge.',
            });
          } else if (payload.event === 'plan_upgraded') {
            queryClient.invalidateQueries({ queryKey: ['authState'] });
            queryClient.invalidateQueries({ queryKey: ['userSettings'] });
            toast.success(`Plan Upgraded to ${payload.planType}! 🎉`, {
              description: 'Your subscription is now active.',
            });
            triggerConfetti();
          }
        } catch (err) {
          console.error('Failed to parse user SSE event:', err);
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
        reconnectTimer = setTimeout(() => {
          connect();
          retryDelay = Math.min(retryDelay * 1.5, 30000);
        }, retryDelay);
      };
    };

    connect();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      eventSource?.close();
    };
  }, [enabled, queryClient]);
}
