import { useTranslations } from 'next-intl';
import { z } from 'zod';

export const validationMenuPermission = () => {
  const intl = useTranslations('Form');

  return z.object({
    menuId: z.coerce
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
