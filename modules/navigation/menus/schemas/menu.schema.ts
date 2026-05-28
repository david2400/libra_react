import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationMenu = () => {
  const v = useValidationMessages();

  return z.object({
    application_id: z.coerce
      .number({ invalid_type_error: v.invalidFormat })
      .int()
      .positive({ message: v.required }),
    name: z.string().min(1, { message: v.required }),
    description: z.string().optional(),
    path: z.string().min(1, { message: v.required }),
    icon: z.string().optional(),
    parent_menu_id: z.coerce
      .number({ invalid_type_error: v.invalidFormat })
      .int()
      .optional()
      .nullable(),
    order: z.coerce
      .number({ invalid_type_error: v.invalidFormat })
      .int()
      .optional()
      .nullable(),
    visible: z.coerce
      .boolean({ invalid_type_error: v.invalidFormat })
      .optional()
      .nullable(),
  });
};
