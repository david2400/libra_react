import { useTranslations } from 'next-intl';
import { z } from 'zod';

export const validationMenu = () => {
  const intl = useTranslations('Form');

  return z.object({
    name: z.string().min(1, { message: intl('requiredField') }),
    label: z.string().optional(),
    icon: z.string().optional(),
    path: z.string().optional(),
    parentId: z.coerce
      .number({ invalid_type_error: intl('requiredField') })
      .int()
      .optional()
      .nullable(),
    order: z.coerce
      .number({ invalid_type_error: intl('requiredField') })
      .int()
      .optional(),
  });
};
