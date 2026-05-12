import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationPermission = () => {
  const v = useValidationMessages();

  return z.object({
    name: z.string().min(1, { message: v.required }),
    description: z.string().optional(),
    resource: z.string().optional(),
    action: z.string().optional(),
  });
};
