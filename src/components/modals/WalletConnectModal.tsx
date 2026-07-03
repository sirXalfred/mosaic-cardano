"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useWalletList, useWallet, useAddress } from '@meshsdk/react';
import Image from 'next/image';
import { truncateWalletAddress } from '@/lib/utils';
import { Button } from '../ui/button';
import { CloseButton } from '../ui/close-button';
import { InteractiveCopy } from '../ui/interactive-copy';

interface WalletConnectModalProps {
  onClose: () => void;
}

export default function WalletConnectModal({ onClose }: WalletConnectModalProps) {
  const wallets = useWalletList();
  const { connect, connected, connecting, name, disconnect, error, wallet } = useWallet();
  const address = useAddress();
  const [networkWarning, setNetworkWarning] = useState(false);
  const justConnected = useRef(false);

  const handleConnect = (walletName: string) => {
    connect(walletName);
    localStorage.setItem('mosaic_connected_wallet', walletName);
    justConnected.current = true;
  };

  const handleDisconnect = () => {
    disconnect();
    localStorage.removeItem('mosaic_connected_wallet');
  };

  useEffect(() => {
    const checkNetwork = async () => {
      if (connected && wallet) {
        try {
          const networkId = await wallet.getNetworkId();
          const isLive = process.env.NEXT_PUBLIC_IS_LIVE === 'true';
          const expectedNetworkId = isLive ? 1 : 0;
          
          if (networkId !== expectedNetworkId) {
            setNetworkWarning(true);
          } else {
            setNetworkWarning(false);

            if (justConnected.current) {
              onClose(); // Automatically close if successful connection on correct network
            }
            justConnected.current = false;
          }
        } catch (e) {
          console.error("Failed to verify network:", e);
        }
      }
    };
    checkNetwork();
  }, [connected, wallet, onClose]);

  useEffect(() => {
    if (error) {
      justConnected.current = false;
    }
  }, [error])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-parchment/80 backdrop-blur-sm">
      <div className="bg-theme-surface w-full max-w-md rounded-3xl p-6 shadow-2xl border border-theme-outline/20 relative animate-in zoom-in-95 duration-200">
        <CloseButton onClick={onClose} />

        <h2 className="text-2xl font-serif text-theme-forest mb-2">
          {
            connected ? 'Connected Wallet' : 'Connect Wallet'
          }
        </h2>
        {
          connected ? (
            <p className="text-sm text-theme-on-surface/60 mb-6">Your wallet is connected.</p>
          ) : (
            <p className="text-sm text-theme-on-surface/60 mb-6">Select your preferred Cardano wallet provider to continue.</p>
          )
        }

        {networkWarning && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-red-700">
              <p className="font-bold">Network Mismatch</p>
              <p className="opacity-90">Please open your wallet extension and switch to {process.env.NEXT_PUBLIC_IS_LIVE === 'true' ? 'Mainnet' : 'Preprod Testnet'}.</p>
            </div>
          </div>
        )}

        {!!error && (
           <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {(error as { message?: string })?.message || 'Failed to connect wallet.'}
           </div>
        )}

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {wallets.length === 0 ? (
            <div className="text-center py-8 text-theme-on-surface/50">
              No wallets found. Please install a Cardano wallet like Nami, Eternl, or Vespr.
            </div>
          ) : (
            wallets.map((wallet, index) => {
              const walletId = (wallet as { id?: string }).id || wallet.name.toLowerCase();
              const isConnecting = connecting && name?.toLowerCase() === walletId;
              const isConnected = connected && name?.toLowerCase() === walletId;

              return (
                <button
                  key={index}
                  onClick={() => handleConnect((wallet as { id?: string }).id || wallet.name.toLowerCase())}
                  disabled={connecting || isConnected}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    isConnected 
                      ? 'bg-theme-accent/5 border-theme-accent text-theme-accent'
                      : 'bg-theme-surface-high border-theme-outline/20 hover:border-theme-forest/30 text-theme-forest hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Image src={wallet.icon} alt={wallet.name} width={32} height={32} className="rounded-md" />
                    <span className="font-bold">{wallet.name}</span>
                  </div>
                  {isConnecting && <Loader2 size={18} className="animate-spin text-theme-accent" />}
                  {isConnected && <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 bg-theme-accent/10 rounded">Connected</span>}
                </button>
              );
            })
          )}
        </div>

        {connected && 
        <div className="flex flex-col w-full mt-6 gap-3">
          {address && (
            <div className="bg-theme-surface-high border border-theme-outline/20 p-3 rounded-xl flex flex-col items-center justify-center gap-1">
              <span className="text-xs text-theme-on-surface/50 uppercase tracking-widest font-bold">Connected Address</span>
              <span className="font-mono text-sm text-theme-forest">{truncateWalletAddress(address, 8) } <InteractiveCopy textToCopy={address} /></span>
            </div>
          )}
          <Button
            variant="destructive"
            onClick={handleDisconnect}
            className='w-full'
          >
            Disconnect Wallet
          </Button>
        </div>
        }
      </div>
    </div>
  );
}
