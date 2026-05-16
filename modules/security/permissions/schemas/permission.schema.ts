import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationPermission = () => {
  const v = useValidationMessages();

  return z.object({
    name: z.string().min(1, { message: v.required }),
    description: z.string().optional(),
    aplications_id: z.number().min(1, { message: v.required }),
    module_aplication_id: z.number().optional(),
  });
};
