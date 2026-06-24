"use client";

import React, { useEffect, useState } from 'react';
import { useWallet } from '@meshsdk/react';
import { Wallet, AlertCircle, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useModals } from '@/contexts/modals-context';
import { MODALS } from '@/lib/modals';
import { useGetUserSettings, useLinkWallet, getWalletNonce, useLoginWithWallet } from '@/services/auth';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { CardanoIcon } from '../ui/icons/CardanoLogo';

interface WalletStatusProps {
  className?: string;
}


export function WalletStatus({ className = '' }: WalletStatusProps) {
  const { connected, connecting, wallet, connect } = useWallet();
  const [networkWarning, setNetworkWarning] = useState(false);
  const { openModal } = useModals();
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    // Auto-connect if a wallet was previously connected
    const persistedWallet = localStorage.getItem('mosaic_connected_wallet');
    if (persistedWallet && !connected && !connecting) {
      connect(persistedWallet);
    }
  }, [connected, connecting, connect]);

  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      if (connected && wallet) {
        try {
          const netId = await wallet.getNetworkId();
          const isLive = process.env.NEXT_PUBLIC_IS_LIVE === 'true';
          const expectedNetId = isLive ? 1 : 0;

          if (isMounted) {
            setNetworkWarning(netId !== expectedNetId);
            const addrs = await wallet.getUsedAddresses();
            if (addrs && addrs.length > 0) {
              setAddress(addrs[0]);
            }
          }
        } catch (e) {
          console.error("Failed to fetch wallet info:", e);
        }
      } else {
        if (isMounted) {
          setNetworkWarning(false);
          setAddress(null);
        }
      }
    };
    checkStatus();
    return () => { isMounted = false; };
  }, [connected, wallet]);

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 9)}...${addr.slice(-4)}`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {connected && networkWarning && (
        <div className="relative group flex items-center">
          <AlertCircle size={18} className="text-red-500 cursor-help" />
          <div className="absolute top-full right-0 mt-2 w-48 bg-red-50 border border-red-200 text-red-700 text-xs p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            Network mismatch. Please switch to {process.env.NEXT_PUBLIC_IS_LIVE === 'true' ? 'Mainnet' : 'Preprod'}.
          </div>
        </div>
      )}

      <button
        onClick={() => openModal(MODALS.WALLET_CONNECT)}
        className={`flex items-center cursor-pointer gap-2 px-3 py-1.5 rounded-full border transition-colors text-xs font-bold font-mono tracking-widest ${connected
          ? 'bg-theme-surface-high border-theme-outline/20 text-theme-forest hover:border-theme-forest/30'
          : 'bg-theme-accent/5 border-theme-accent/20 text-theme-accent hover:bg-theme-accent/10'
          }`}
      >
        <Wallet size={14} className={connected ? "text-theme-forest/60" : "text-theme-accent"} />
        {connected ? (address ? truncateAddress(address) : 'CONNECTING...') : 'CONNECT WALLET'}
      </button>
    </div>
  );
}


export function WalletConnectedText() {
  const { connected } = useWallet();
  return (
    connected ? 'Connected securely' : 'Not connected'
  );
}

export function WalletLinkButton() {
  const { connected, wallet } = useWallet();
  const { data: settings } = useGetUserSettings();
  const { mutateAsync: linkWallet, isPending } = useLinkWallet();

  if (!connected) return null;

  const handleLink = async () => {
    try {
      const address = (await wallet.getUsedAddresses())[0];
      if (!address) throw new Error("No address found");

      const { nonce } = await getWalletNonce();
      const signature = await wallet.signData(nonce, address);

      await linkWallet({
        signature,
        payload: nonce,
        address
      });
      toast.success("Wallet linked successfully");

    } catch (err: unknown) {
      console.error(err);
      toast.error((err as Error).message || "Failed to link wallet");
    }
  };

  // If the user's saved wallet matches the currently connected wallet, show nothing or "Linked"
  if (settings?.walletAddress) {
    return (
      <div className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 flex items-center gap-2">
        <LinkIcon size={14} /> LINKED
      </div>
    );
  }

  return (
    <button
      onClick={handleLink}
      disabled={isPending}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-theme-forest text-theme-surface-high hover:bg-theme-forest/90 transition-colors text-xs font-bold font-mono tracking-widest disabled:opacity-50"
    >
      {isPending ? <Loader2 size={14} className="animate-spin" /> : <LinkIcon size={14} />}
      LINK TO ACCOUNT
    </button>
  );
}

export function WalletLoginButton() {
  const { wallet, connected } = useWallet();
  const { mutateAsync: loginWithWallet, isPending } = useLoginWithWallet();
  const { openModal } = useModals();
  const [pendingLogin, setPendingLogin] = useState(false);

  const executeLogin = async () => {
    try {
      const activeWallet = wallet;
      if (!activeWallet) throw new Error("Wallet instance not found");

      const address = (await activeWallet.getUsedAddresses())[0];
      if (!address) throw new Error("No address found in wallet");

      toast.loading("Sign the message in your wallet to login...", { id: 'wallet-login' });
      const { nonce } = await getWalletNonce();
      const signature = await activeWallet.signData(nonce, address);

      await loginWithWallet({
        signature,
        payload: nonce,
        address
      });
      toast.success("Logged in successfully via Wallet", { id: 'wallet-login' });
      window.location.href = '/'; // Simple redirect to home
    } catch (err) {
      const errorMessage = (err as Error).message || "Wallet login failed";
      console.error(errorMessage);
      toast.error(errorMessage, { id: 'wallet-login' });
      setPendingLogin(false);
    }
  };

  useEffect(() => {
    if (connected && wallet && pendingLogin) {
      setPendingLogin(false);
      executeLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, wallet, pendingLogin]);

  const handleWalletLogin = async () => {
    if (!connected) {
      setPendingLogin(true);
      openModal(MODALS.WALLET_CONNECT);
      return;
    }
    await executeLogin();
  };

  return (
    <Button
      variant="outline"
      className='w-full group/cardano'
      size="lg"
      onClick={handleWalletLogin}
      disabled={isPending || pendingLogin}
    >
      {isPending || pendingLogin ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        <>
          <CardanoIcon hoverInvert />
          CARDANO WALLET
        </>
      )
      }
    </Button>
  );
}