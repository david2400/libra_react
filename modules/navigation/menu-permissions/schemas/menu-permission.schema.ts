import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationMenuPermission = () => {
  const v = useValidationMessages();

  return z.object({
    menu_id: z.coerce
      .number({ invalid_type_error: v.invalidFormat })
      .int()
      .positive({ message: v.required }),
    permission_id: z.coerce
      .number({ invalid_type_error: v.invalidFormat })
      .int()
      .positive({ message: v.required }),
    is_active: z.boolean().optional(),
  });
};

export const validationUpdateMenuPermission = () => {
  const v = useValidationMessages();

  return z.object({
    menu_id: z.coerce
      .number({ invalid_type_error: v.invalidFormat })
      .int()
      .positive({ message: v.required }),
    permission_id: z.coerce
      .number({ invalid_type_error: v.invalidFormat })
      .int()
      .positive({ message: v.required }),
    is_active: z.boolean().optional(),
  });
};
