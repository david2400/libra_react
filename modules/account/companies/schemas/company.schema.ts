import { useTranslations } from 'next-intl';
import { z } from 'zod';

export const validationCompany = () => {
  const intl = useTranslations('Form');

  return z.object({
    name: z.string().min(1, { message: intl('requiredField') }),
    description: z.string().optional(),
    industry: z.string().optional(),
    size: z.enum(['small', 'medium', 'large', 'enterprise']).optional(),
    website: z.string().url().optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
  });
};
