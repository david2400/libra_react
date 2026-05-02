import { useTranslations } from 'next-intl';
import { z } from 'zod';

export const validationUser = () => {
  const intl = useTranslations('Form');

  return z.object({
    username: z.string().min(1, { message: intl('requiredField') }),
    password: z.string().min(6, { message: 'Mínimo 6 caracteres' }).optional(),
    status: z.string().optional(),
    companyId: z.coerce.number().optional(),
    clientId: z.coerce.number().optional(),
  });
};
