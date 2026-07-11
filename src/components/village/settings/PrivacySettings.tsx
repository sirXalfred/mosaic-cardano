import React, { useState } from 'react';
import { useUpdateVillageSettings, VillageSettings } from '@/services/villages';
import { Button } from '@/components/ui/button';
import { Globe, Lock } from 'lucide-react';

interface Props {
  communityId: string;
  settings: VillageSettings;
  isCreator: boolean;
}

export default function PrivacySettings({ communityId, settings, isCreator }: Props) {
  const [isPublic, setIsPublic] = useState(settings.isPublic ?? true);
  const { mutate: updateSettings, isPending } = useUpdateVillageSettings(communityId);

  const handleSave = () => {
    if (!isCreator) return;
    updateSettings({ isPublic });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-semibold text-theme-on-surface">Privacy Settings</h2>
        {isCreator && (
          <Button onClick={handleSave} disabled={isPending || isPublic === settings.isPublic}>
            {isPending ? 'Saving...' : 'Save Privacy'}
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          disabled={!isCreator}
          onClick={() => setIsPublic(true)}
          className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-colors ${
            isPublic ? 'border-theme-accent bg-theme-accent/5' : 'border-theme-outline/20 bg-theme-surface hover:border-theme-outline/40'
          } ${!isCreator && 'opacity-70 cursor-not-allowed'}`}
        >
          <div className={`p-2 rounded-lg ${isPublic ? 'bg-theme-accent/10 text-theme-accent' : 'bg-theme-surface-raised text-theme-on-surface/50'}`}>
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-theme-on-surface">Public Community</h3>
            <p className="text-sm text-theme-on-surface/60 font-sans mt-1">
              Anyone can view artifacts and join the community instantly.
            </p>
          </div>
        </button>

        <button
          disabled={!isCreator}
          onClick={() => setIsPublic(false)}
          className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-colors ${
            !isPublic ? 'border-theme-accent bg-theme-accent/5' : 'border-theme-outline/20 bg-theme-surface hover:border-theme-outline/40'
          } ${!isCreator && 'opacity-70 cursor-not-allowed'}`}
        >
          <div className={`p-2 rounded-lg ${!isPublic ? 'bg-theme-accent/10 text-theme-accent' : 'bg-theme-surface-raised text-theme-on-surface/50'}`}>
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-theme-on-surface">Request to Join</h3>
            <p className="text-sm text-theme-on-surface/60 font-sans mt-1">
              Users must request membership, and the Creator must approve them.
            </p>
          </div>
        </button>
      </div>
    </section>
  );
}
