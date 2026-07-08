import { NextResponse } from 'next/server';
import { authService } from '@/services/backend/auth.service';
import { settingsService } from '@/services/backend/settings.service';
import { badgeService } from '@/services/backend/badge.service';
import { villageService } from '@/services/backend/village.service';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const user = await authService.getUserByUsername(username);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const settings = await settingsService.getSettings(user.id);
    
    // Return default empty reputation schema, respecting privacy settings
    let userBadges: { id: string; type: string; status: string }[] = [];
    if (settings.profile.showBadges) {
      const realBadges = await badgeService.getUserBadges(user.id);
      userBadges = realBadges.map(b => ({
        id: b.id,
        type: b.type,
        status: b.status
      }));
    }

    let userCommunities: { id: string; name: string; role: string }[] = [];
    if (settings.profile.showCommunities) {
      const realComms = await villageService.listUserVillages(user.id);
      userCommunities = realComms.map(v => ({
        id: v.id,
        name: v.name,
        role: "member"
      }));
    }

    const defaultReputation = {
      badges: userBadges,
      skills: [],
      communities: userCommunities,
      projects: [],
      supportHistory: []
    };
    return NextResponse.json(defaultReputation);
  } catch (error) {
    console.error('Error fetching user reputation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
