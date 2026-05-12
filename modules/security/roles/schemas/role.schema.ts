import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationRole = () => {
  const v = useValidationMessages();

  return z.object({
    name: z.string().min(1, { message: v.required }),
    description: z.string().optional(),
    permission_ids: z.array(z.coerce.number()).optional(),
    menu_ids: z.array(z.coerce.number()).optional(),
  });
};
