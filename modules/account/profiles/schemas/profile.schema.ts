import { useTranslations } from 'next-intl';
import { z } from 'zod';

export const validationProfile = () => {
  const intl = useTranslations('Form');

  return z.object({
    userId: z.coerce.number().or(z.string()),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    display_name: z.string().optional(),
    avatar_url: z.string().url().optional().or(z.literal('')),
    bio: z.string().optional(),
    phone: z.string().optional(),
    timezone: z.string().optional(),
    language: z.string().optional(),
    date_format: z.string().optional(),
    time_format: z.enum(['12h', '24h']).optional(),
    theme: z.enum(['light', 'dark', 'auto']).optional(),
  });
};
