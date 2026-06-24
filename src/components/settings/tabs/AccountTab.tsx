import { useGetUserSettings } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { useModals } from '@/contexts/modals-context';
import { MODALS } from '@/lib/modals';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const WalletConnectedText = dynamic(() => import('@/components/wallet/WalletStatus').then((m) => m.WalletConnectedText), {
  loading: () => <Skeleton className="w-30 h-6" />
});
const WalletStatus = dynamic(() => import('@/components/wallet/WalletStatus').then((m) => m.WalletStatus), {
  loading: () => <Skeleton className="w-40 h-12" />
});
const WalletLinkButton = dynamic(() => import('@/components/wallet/WalletStatus').then((m) => m.WalletLinkButton), {
  loading: () => <Skeleton className="w-32 h-10" />
});



export default function AccountTab() {
  const { data: settings, isLoading: isSettingsLoading } = useGetUserSettings();
  const { openModal } = useModals();

  return (
    <div className="space-y-8 animate-onrender --fade-in">
      <div>
        <h2 className="text-xl font-bold text-theme-forest mb-2">Account Settings</h2>
        <p className="text-sm text-theme-on-surface/60">Manage your account credentials and connected services.</p>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-theme-on-surface">Email Address</label>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="email"
              disabled
              value={isSettingsLoading ? 'Loading...' : (settings?.email || 'user@example.com')}
              className="flex-1 p-2.5 bg-theme-surface-high border border-theme-outline/20 rounded-xl text-sm font-medium text-theme-on-surface opacity-70 cursor-not-allowed"
            />
            <Button variant="outline">Change Email</Button>
          </div>
          <p className="text-xs text-theme-on-surface/50">Your email address is used for login and notifications.</p>
        </div>

        <hr className="border-theme-outline/10" />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-theme-on-surface">Password</label>
          <div className="flex items-center justify-between p-4 bg-theme-surface-high border border-theme-outline/20 rounded-xl">
            <div>
              <p className="text-sm font-medium text-theme-forest">Password is set</p>
              <p className="text-xs text-theme-on-surface/60 mt-1">Last changed: Never</p>
            </div>
            <Button variant="outline" size="sm">Update Password</Button>
          </div>
        </div>

        <hr className="border-theme-outline/10" />

        <div>
          <h3 className="text-sm font-bold text-theme-on-surface mb-3">Subscription Plan</h3>
          <div className="flex items-center justify-between p-4 bg-theme-surface-high border border-theme-outline/20 rounded-xl mb-4">
            <div>
              <p className="text-sm font-medium text-theme-forest">Current Plan: <span className="font-bold text-theme-accent">{isSettingsLoading ? '...' : (settings?.planType || 'FREE')}</span></p>
              <p className="text-xs text-theme-on-surface/60 mt-1">Upgrade for more village features.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => openModal(MODALS.PRICING)}>See other plans</Button>
          </div>
        </div>

        <hr className="border-theme-outline/10" />

        <div>
          <h3 className="text-sm font-bold text-theme-on-surface mb-3">Wallet Connection</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-theme-surface-high border border-theme-outline/20 rounded-xl gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0033AD]/10 flex items-center justify-center text-[#0033AD] font-bold text-lg">₳</div>
              <div>
                <p className="text-sm font-medium text-theme-forest">Cardano Wallet</p>
                <p className="text-xs text-theme-on-surface/60">
                  <WalletConnectedText />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WalletLinkButton />
              <WalletStatus />
            </div>
          </div>
          <p className="text-xs text-theme-on-surface/50 mt-2">Connect your wallet to receive SCR rewards, participate in governance, and manage your subscriptions.</p>
        </div>

        <hr className="border-theme-outline/10" />

        <div>
          <h3 className="text-sm font-bold text-theme-on-surface mb-3">Connected Accounts</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-theme-surface-high border border-theme-outline/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center text-[#1DA1F2] font-bold">X</div>
                <div>
                  <p className="text-sm font-medium text-theme-forest">Twitter / X</p>
                  <p className="text-xs text-theme-on-surface/60">Not connected</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Connect</Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-theme-surface-high border border-theme-outline/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#333]/10 flex items-center justify-center text-[#333] font-bold">GH</div>
                <div>
                  <p className="text-sm font-medium text-theme-forest">GitHub</p>
                  <p className="text-xs text-theme-on-surface/60">Not connected</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Connect</Button>
            </div>
          </div>
        </div>

        <hr className="border-theme-outline/10" />

        <div className="pt-4">
          <h3 className="text-sm font-bold text-red-600 mb-2">Danger Zone</h3>
          <p className="text-xs text-theme-on-surface/60 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
