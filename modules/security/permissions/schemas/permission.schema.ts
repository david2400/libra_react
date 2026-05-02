import { useTranslations } from 'next-intl';
import { z } from 'zod';

export const validationPermission = () => {
  const intl = useTranslations('Form');

  return z.object({
    name: z.string().min(1, { message: intl('requiredField') }),
    description: z.string().optional(),
    resource: z.string().optional(),
    action: z.string().optional(),
  });
};
