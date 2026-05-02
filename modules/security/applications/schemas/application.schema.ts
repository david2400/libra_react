import { useTranslations } from 'next-intl';
import { z } from 'zod';

export const validationApplication = () => {
  const intl = useTranslations('Form');

  return z.object({
    name: z.string().min(1, { message: intl('requiredField') }),
    description: z.string().optional(),
    version: z.string().optional(),
    status: z.enum(['active', 'inactive', 'maintenance']).optional(),
    baseUrl: z.string().url().optional().or(z.literal('')),
  });
};
