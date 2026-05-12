import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationMenu = () => {
  const v = useValidationMessages();

  return z.object({
    name: z.string().min(1, { message: v.required }),
    label: z.string().optional(),
    icon: z.string().optional(),
    path: z.string().optional(),
    parentId: z.coerce
      .number({ invalid_type_error: v.invalidFormat })
      .int()
      .optional()
      .nullable(),
    order: z.coerce
      .number({ invalid_type_error: v.invalidFormat })
      .int()
      .optional(),
  });
};
