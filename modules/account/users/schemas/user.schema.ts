import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationUser = () => {
  const v = useValidationMessages();

  return z.object({
    username: z.string().min(1, { message: v.required }),
    password: z.string().min(6, { message: v.minLength(6) }).optional(),
    status: z.string().optional(),
    // companyId: z.coerce.number().optional(),
    client_id: z.coerce.number().optional(),
  });
};
