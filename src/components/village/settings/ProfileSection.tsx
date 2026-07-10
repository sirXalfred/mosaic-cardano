import React, { useState } from 'react';
import { useUpdateVillageSettings, VillageSettings } from '@/services/villages';
import { Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { createVillageProfileImage } from '@/lib/create-village-profile-image';
import { toast } from 'sonner';

interface Props {
  communityId: string;
  settings: VillageSettings;
  isCreator: boolean;
}

export default function ProfileSection({ communityId, settings, isCreator }: Props) {
  const [logoUrl, setLogoUrl] = useState(settings?.profileImageUrl ?? '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { mutate: updateSettings, isPending } = useUpdateVillageSettings(communityId);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    
    try {
      setIsUploading(true);
      const url = await uploadToCloudinary(file);
      setLogoUrl(url);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    if (!isCreator) return;
    updateSettings({ profileImageUrl: logoUrl });
  };

  const handleResetToDefault = () => {
    const generativeUrl = createVillageProfileImage(settings.name);
    setLogoUrl(generativeUrl);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-display font-semibold text-theme-on-surface">Community Logo</h2>
      <div className="flex items-start gap-6">
        <div 
          className={`relative w-24 h-24 rounded-2xl bg-theme-surface-raised border flex items-center justify-center overflow-hidden shrink-0 transition-colors group ${isCreator ? 'cursor-pointer border-theme-outline/20 hover:border-theme-accent' : 'border-theme-outline/20'}`}
          onClick={() => isCreator && fileInputRef.current?.click()}
        >
          {logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={logoUrl} alt="Community Logo" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
          ) : (
            <ImageIcon className="w-8 h-8 text-theme-on-surface/30" />
          )}
          {isCreator && (
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Upload className="text-white w-6 h-6" />
             </div>
          )}
        </div>
        
        <div className="flex-1 space-y-4">
          <p className="text-sm text-theme-on-surface/60 font-sans">
            This is the primary image representing your community across the platform.
          </p>
          <div className="flex items-center gap-3">
            {isCreator && (
              <>
                <input 
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <div className="flex items-center gap-3 w-full">
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isPending}
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  
                  {logoUrl && !logoUrl.includes('dicebear.com') && (
                    <Button 
                      variant="ghost" 
                      onClick={handleResetToDefault}
                      disabled={isUploading || isPending}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      Reset to Default
                    </Button>
                  )}
                  
                  <div className="flex-1"></div>
                </div>
              </>
            )}
            {isCreator && (
              <Button onClick={handleSave} disabled={isPending || logoUrl === settings.profileImageUrl}>
                Save Logo
              </Button>
            )}
          </div>
          {!isCreator && (
            <p className="text-xs text-theme-on-surface/40 italic">Read-only: Only the creator can update the logo.</p>
          )}
        </div>
      </div>
    </section>
  );
}
