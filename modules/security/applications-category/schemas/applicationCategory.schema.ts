import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationApplicationCategory = () => {
  const v = useValidationMessages();

  return z.object({
    parent_category_application_id: z.coerce
      .number({ invalid_type_error: v.invalidFormat })
      .int()
      .optional()
      .nullable(),
    name: z.string().min(1, { message: v.required }),
    description: z.string().optional(),

  });
};
