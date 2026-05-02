import { useTranslations } from 'next-intl';
import { z } from 'zod';

export const validationRole = () => {
  const intl = useTranslations('Form');

  return z.object({
    name: z.string().min(1, { message: intl('requiredField') }),
    description: z.string().optional(),
    permission_ids: z.array(z.coerce.number()).optional(),
    menu_ids: z.array(z.coerce.number()).optional(),
  });
};
