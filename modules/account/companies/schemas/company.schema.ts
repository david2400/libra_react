import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationCompany = () => {
  const v = useValidationMessages();

  return z.object({
    name: z.string().min(1, { message: v.required }),
    description: z.string().optional(),
    industry: z.string().optional(),
    size: z.enum(['small', 'medium', 'large', 'enterprise']).optional(),
    website: z.string().url({ message: v.invalidUrl }).optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email({ message: v.invalidEmail }).optional().or(z.literal('')),
  });
};
