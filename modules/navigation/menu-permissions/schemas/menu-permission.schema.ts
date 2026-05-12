import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationMenuPermission = () => {
  const v = useValidationMessages();

  return z.object({
    menuId: z.coerce
      .number({ invalid_type_error: v.invalidFormat })
      .int()
      .positive({ message: v.required }),
    permissionId: z.coerce
      .number({ invalid_type_error: v.invalidFormat })
      .int()
      .positive({ message: v.required }),
    isActive: z.boolean().optional(),
  });
};
