import React, { useState } from 'react';
import { useDebouncedSettingsUpdate } from '@/services/settings';
import { UserSettings } from '@/types/settings';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { BellRing, ShieldAlert, Loader2 } from 'lucide-react';

export default function NotificationsTab({ settings }: { settings: UserSettings['notifications'] }) {
  const { mutate } = useDebouncedSettingsUpdate();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [pushStatus, setPushStatus] = useState<string>('default');

  React.useEffect(() => {
    if ('Notification' in window) {
      setPushStatus(Notification.permission);
    }
  }, []);

  const handleToggle = (key: keyof UserSettings['notifications'], checked: boolean) => {
    mutate({ notifications: { ...settings, [key]: checked } });
  };

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notifications are not supported by your browser.');
      return;
    }
    
    setIsSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);
      
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        });

        // Send to backend
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const SettingToggleRow = ({ 
    title, 
    description,
    inAppKey,
    pushKey
  }: { 
    title: string; 
    description: string;
    inAppKey: keyof UserSettings['notifications'];
    pushKey: keyof UserSettings['notifications'];
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-theme-outline/5 last:border-0">
      <div className="pr-4 flex-1">
        <h3 className="text-sm font-bold text-theme-on-surface">{title}</h3>
        <p className="text-xs text-theme-on-surface/60 mt-1 max-w-sm">{description}</p>
      </div>
      <div className="flex items-center gap-6 shrink-0">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-theme-on-surface/40">In-App</span>
          <Switch 
            checked={settings[inAppKey] as boolean}
            onCheckedChange={(c) => handleToggle(inAppKey, c)}
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-theme-on-surface/40">Push</span>
          <Switch 
            checked={settings[pushKey] as boolean}
            onCheckedChange={(c) => handleToggle(pushKey, c)}
            disabled={pushStatus !== 'granted'}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-onrender --fade-in">
      <div>
        <h2 className="text-xl font-bold text-theme-forest mb-2">Notification Settings</h2>
        <p className="text-sm text-theme-on-surface/60">Choose how and when you want to be notified.</p>
      </div>

      <div className="bg-theme-surface-low border border-theme-outline/10 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${pushStatus === 'granted' ? 'bg-green-100 text-green-600' : 'bg-theme-clay/10 text-theme-accent'}`}>
            {pushStatus === 'granted' ? <BellRing size={20} /> : <ShieldAlert size={20} />}
          </div>
          <div>
            <h3 className="font-bold text-theme-forest text-sm">Browser Push Permissions</h3>
            <p className="text-xs text-theme-on-surface/60 mt-1">
              {pushStatus === 'granted' 
                ? 'Push notifications are enabled for this browser.' 
                : 'Enable push notifications to receive real-time alerts even when Mosaic is closed.'}
            </p>
          </div>
        </div>
        {pushStatus !== 'granted' && (
          <Button onClick={subscribeToPush} disabled={isSubscribing} className="shrink-0 bg-theme-forest hover:bg-theme-forest/90 text-white">
            {isSubscribing ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            {isSubscribing ? 'Subscribing...' : 'Enable Push'}
          </Button>
        )}
      </div>

      <div className="space-y-2 mt-8">
        <h3 className="font-serif text-theme-forest mb-2 border-b border-theme-outline/10 pb-2">Interaction Alerts</h3>
        
        <SettingToggleRow 
          title="Mentions & Tags" 
          description="When someone @mentions you in a post or comment."
          inAppKey="inAppMentions"
          pushKey="pushMentions"
        />
        
        <SettingToggleRow 
          title="Replies & Comments" 
          description="When someone replies to your posts or leaves a comment on your piece."
          inAppKey="inAppReplies"
          pushKey="pushReplies"
        />

        <SettingToggleRow 
          title="Upvotes" 
          description="When someone upvotes your posts or contributions."
          inAppKey="inAppUpvotes"
          pushKey="pushUpvotes"
        />
      </div>

      <div className="space-y-2 mt-8">
        <h3 className="font-serif text-theme-forest mb-2 border-b border-theme-outline/10 pb-2 mt-8">Publishing & Communities</h3>
        
        <SettingToggleRow 
          title="Signature Requests" 
          description="When you are added as a co-author and your cryptographic signature is required."
          inAppKey="inAppSignatureRequests"
          pushKey="pushSignatureRequests"
        />

        <SettingToggleRow 
          title="Piece Updates" 
          description="Status updates regarding pieces you have contributed to."
          inAppKey="inAppPieceUpdates"
          pushKey="pushPieceUpdates"
        />

        <SettingToggleRow 
          title="Community Announcements" 
          description="Important broadcasts from villages you are a member of."
          inAppKey="inAppCommunityAlerts"
          pushKey="pushCommunityAlerts"
        />

        <SettingToggleRow 
          title="System Updates" 
          description="App-wide updates from the Mosaic team."
          inAppKey="inAppSystemUpdates"
          pushKey="pushSystemUpdates"
        />
      </div>
    </div>
  );
}
