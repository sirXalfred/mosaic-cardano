import { z } from 'zod';
import { runRead, runWrite } from './shared';
import { cacheKey, invalidateCacheKey } from './cache';
import { UserSettingsSchema, type UserSettings, defaultUserSettings } from '@/types/settings';

export const settingsService = {
  async getSettings(userId: string): Promise<UserSettings> {
    const parsedUserId = z.string().uuid().parse(userId);

    const rows = await runRead(
      `
        MATCH (u:Mosaic_User {id: $userId})
        RETURN u.settings AS settings
        LIMIT 1
      `,
      { userId: parsedUserId },
      row => row.settings,
    );

    if (rows.length === 0) {
      throw new Error('User not found');
    }

    const settingsJsonStr = rows[0];
    if (!settingsJsonStr) {
      return defaultUserSettings;
    }

    try {
      const parsed = JSON.parse(settingsJsonStr as string);
      return UserSettingsSchema.parse(parsed);
    } catch (e) {
      console.error('Failed to parse user settings', e);
      return defaultUserSettings;
    }
  },

  async updateSettings(userId: string, partialSettings: DeepPartial<UserSettings>): Promise<UserSettings> {
    const parsedUserId = z.string().uuid().parse(userId);

    // Get current settings first
    const currentSettings = await this.getSettings(parsedUserId);

    // Deep merge current settings with partial updates
    const mergedSettings = {
      ...currentSettings,
      profile: { ...currentSettings.profile, ...partialSettings.profile },
      privacy: { ...currentSettings.privacy, ...partialSettings.privacy },
      feed: { ...currentSettings.feed, ...partialSettings.feed },
      notifications: { ...currentSettings.notifications, ...partialSettings.notifications },
    };

    // Validate merged
    const validated = UserSettingsSchema.parse(mergedSettings);
    const settingsStr = JSON.stringify(validated);
    const now = Date.now();

    await runWrite(
      `
        MATCH (u:Mosaic_User {id: $userId})
        SET u.settings = $settings, u.updatedAt = $now
        RETURN u.id
      `,
      { userId: parsedUserId, settings: settingsStr, now },
      row => row,
    );

    // Invalidate user cache because settings are part of user node conceptually, 
    // though auth.service doesn't always query them.
    await invalidateCacheKey(cacheKey('user', parsedUserId));

    return validated;
  }
};

type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;
