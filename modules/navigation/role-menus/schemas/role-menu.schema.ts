import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationRoleMenu = () => {
  const v = useValidationMessages();

  return z.object({
    roleId: z.coerce
      .number({ invalid_type_error: v.invalidFormat })
      .int()
      .positive({ message: v.required }),
    menuId: z.coerce
      .number({ invalid_type_error: v.invalidFormat })
      .int()
      .positive({ message: v.required }),
    isActive: z.boolean().optional(),
    canView: z.boolean().optional(),
    canEdit: z.boolean().optional(),
  });
};
