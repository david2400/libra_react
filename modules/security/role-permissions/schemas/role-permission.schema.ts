import { useTranslations } from 'next-intl';
import { z } from 'zod';

export const validationRolePermission = () => {
  const intl = useTranslations('Form');

  return z.object({
    roleId: z.coerce
      .number({ invalid_type_error: intl('requiredField') })
      .int()
      .positive({ message: intl('requiredField') }),
    permissionId: z.coerce
      .number({ invalid_type_error: intl('requiredField') })
      .int()
      .positive({ message: intl('requiredField') }),
    isActive: z.boolean().optional(),
  });
};
