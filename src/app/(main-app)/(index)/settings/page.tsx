
import { SettingsTab } from '@/components/settings/SettingsSidebar';
import SettingsView from '@/components/settings/SettingsView';

export const dynamic = 'force-dynamic';

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const tab = params.tab as SettingsTab | undefined;
  
  return <SettingsView initialTab={tab} />;
}
