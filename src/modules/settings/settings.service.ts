import prisma from '../../common/config/database.config';
import { AppError } from '../../common/middleware/error.middleware';

// Define the standard settings keys used in the app
export const SETTING_KEYS = {
  ARTICLE_CATEGORIES: 'article_categories',
  CONTACT_CATEGORIES: 'contact_categories',
  EVENT_TYPES: 'event_types',
  SITE_NAME: 'site_name',
  SITE_DESCRIPTION: 'site_description',
  SOCIAL_LINKS: 'social_links',
} as const;

// Default values for settings
const DEFAULT_SETTINGS: Record<string, { value: string; type: string; description: string }> = {
  [SETTING_KEYS.ARTICLE_CATEGORIES]: {
    value: JSON.stringify(['Music', 'Culture', 'Lifestyle', 'Events']),
    type: 'json',
    description: 'Categories available for editorial articles',
  },
  [SETTING_KEYS.CONTACT_CATEGORIES]: {
    value: JSON.stringify(['General', 'Artist', 'DJ', 'Designer', 'Partnership', 'Press']),
    type: 'json',
    description: 'Categories/types for contact form submissions',
  },
  [SETTING_KEYS.EVENT_TYPES]: {
    value: JSON.stringify(['Concert', 'Festival', 'Club Night', 'Pop-up', 'Exhibition', 'Workshop']),
    type: 'json',
    description: 'Types of events',
  },
  [SETTING_KEYS.SITE_NAME]: {
    value: 'Mutuals+',
    type: 'text',
    description: 'Site name',
  },
  [SETTING_KEYS.SITE_DESCRIPTION]: {
    value: 'Culture, curated.',
    type: 'text',
    description: 'Site tagline/description',
  },
  [SETTING_KEYS.SOCIAL_LINKS]: {
    value: JSON.stringify({
      instagram: 'https://instagram.com/mutualsplus',
      twitter: 'https://twitter.com/mutualsplus',
    }),
    type: 'json',
    description: 'Social media links',
  },
};

export class SettingsService {
  /**
   * Initialize default settings if they don't exist
   */
  async initializeDefaults(): Promise<void> {
    for (const [key, setting] of Object.entries(DEFAULT_SETTINGS)) {
      const existing = await prisma.siteSetting.findUnique({ where: { key } });
      if (!existing) {
        await prisma.siteSetting.create({
          data: {
            key,
            value: setting.value,
            type: setting.type,
            description: setting.description,
          },
        });
      }
    }
  }

  /**
   * Get all settings
   */
  async getAllSettings() {
    const settings = await prisma.siteSetting.findMany({
      orderBy: { key: 'asc' },
    });

    // Parse JSON values
    return settings.map((setting) => ({
      ...setting,
      parsedValue: setting.type === 'json' ? JSON.parse(setting.value) : setting.value,
    }));
  }

  /**
   * Get setting by key
   */
  async getSettingByKey(key: string) {
    const setting = await prisma.siteSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new AppError(`Setting with key "${key}" not found`, 404);
    }

    return {
      ...setting,
      parsedValue: setting.type === 'json' ? JSON.parse(setting.value) : setting.value,
    };
  }

  /**
   * Update setting by key
   */
  async updateSetting(key: string, value: string | object, type?: string, description?: string) {
    // Check if setting exists
    const existing = await prisma.siteSetting.findUnique({ where: { key } });

    const valueString = typeof value === 'object' ? JSON.stringify(value) : value;
    const inferredType = type || (typeof value === 'object' ? 'json' : 'text');

    if (existing) {
      const updated = await prisma.siteSetting.update({
        where: { key },
        data: {
          value: valueString,
          ...(type && { type }),
          ...(description && { description }),
        },
      });

      return {
        ...updated,
        parsedValue: updated.type === 'json' ? JSON.parse(updated.value) : updated.value,
      };
    } else {
      // Create new setting
      const created = await prisma.siteSetting.create({
        data: {
          key,
          value: valueString,
          type: inferredType,
          description: description || '',
        },
      });

      return {
        ...created,
        parsedValue: created.type === 'json' ? JSON.parse(created.value) : created.value,
      };
    }
  }

  /**
   * Delete setting by key
   */
  async deleteSetting(key: string) {
    const existing = await prisma.siteSetting.findUnique({ where: { key } });

    if (!existing) {
      throw new AppError(`Setting with key "${key}" not found`, 404);
    }

    await prisma.siteSetting.delete({
      where: { key },
    });

    return { message: `Setting "${key}" deleted successfully` };
  }

  /**
   * Get article categories
   */
  async getArticleCategories(): Promise<string[]> {
    try {
      const setting = await this.getSettingByKey(SETTING_KEYS.ARTICLE_CATEGORIES);
      return setting.parsedValue as string[];
    } catch {
      return DEFAULT_SETTINGS[SETTING_KEYS.ARTICLE_CATEGORIES].value
        ? JSON.parse(DEFAULT_SETTINGS[SETTING_KEYS.ARTICLE_CATEGORIES].value)
        : [];
    }
  }

  /**
   * Update article categories
   */
  async updateArticleCategories(categories: string[]) {
    return this.updateSetting(
      SETTING_KEYS.ARTICLE_CATEGORIES,
      categories,
      'json',
      'Categories available for editorial articles'
    );
  }

  /**
   * Get contact form categories
   */
  async getContactCategories(): Promise<string[]> {
    try {
      const setting = await this.getSettingByKey(SETTING_KEYS.CONTACT_CATEGORIES);
      return setting.parsedValue as string[];
    } catch {
      return DEFAULT_SETTINGS[SETTING_KEYS.CONTACT_CATEGORIES].value
        ? JSON.parse(DEFAULT_SETTINGS[SETTING_KEYS.CONTACT_CATEGORIES].value)
        : [];
    }
  }

  /**
   * Update contact form categories
   */
  async updateContactCategories(categories: string[]) {
    return this.updateSetting(
      SETTING_KEYS.CONTACT_CATEGORIES,
      categories,
      'json',
      'Categories/types for contact form submissions'
    );
  }

  /**
   * Get event types
   */
  async getEventTypes(): Promise<string[]> {
    try {
      const setting = await this.getSettingByKey(SETTING_KEYS.EVENT_TYPES);
      return setting.parsedValue as string[];
    } catch {
      return DEFAULT_SETTINGS[SETTING_KEYS.EVENT_TYPES].value
        ? JSON.parse(DEFAULT_SETTINGS[SETTING_KEYS.EVENT_TYPES].value)
        : [];
    }
  }

  /**
   * Update event types
   */
  async updateEventTypes(types: string[]) {
    return this.updateSetting(
      SETTING_KEYS.EVENT_TYPES,
      types,
      'json',
      'Types of events'
    );
  }
}
