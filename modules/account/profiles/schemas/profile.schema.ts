import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationProfile = () => {
  const v = useValidationMessages();

  return z.object({
    userId: z.coerce.number().or(z.string()),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    display_name: z.string().optional(),
    avatar_url: z.string().url({ message: v.invalidUrl }).optional().or(z.literal('')),
    bio: z.string().optional(),
    phone: z.string().optional(),
    timezone: z.string().optional(),
    language: z.string().optional(),
    date_format: z.string().optional(),
    time_format: z.enum(['12h', '24h']).optional(),
    theme: z.enum(['light', 'dark', 'auto']).optional(),
  });
};
