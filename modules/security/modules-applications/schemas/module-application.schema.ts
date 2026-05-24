import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationModuleApplication = () => {
  const v = useValidationMessages();

  return z.object({
    name: z.string().min(1, { message: v.required }),
    description: z.string().optional(),
    application_id: z.coerce
      .number({ invalid_type_error: v.invalidFormat })
      .int()
      .positive({ message: v.required }),
    parent_module_application_id: z.coerce
      .number({ invalid_type_error: v.invalidFormat })
      .int()
      .optional()
      .nullable(),
    publication_date: z.coerce.date().optional().nullable(),
    level: z.coerce
      .number({ invalid_type_error: v.invalidFormat })
      .int()
      .optional()
      .nullable(),
    path: z.string().optional().nullable(),
  });
};
