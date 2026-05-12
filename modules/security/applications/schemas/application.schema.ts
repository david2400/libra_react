import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationApplication = () => {
  const v = useValidationMessages();

  return z.object({
    name: z.string().min(1, { message: v.required }),
    description: z.string().optional(),
    version: z.string().optional(),
    status: z.enum(['active', 'inactive', 'maintenance']).optional(),
    baseUrl: z.string().url({ message: v.invalidUrl }).optional().or(z.literal('')),
  });
};
