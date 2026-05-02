import { useTranslations } from 'next-intl';
import { z } from 'zod';

export const validationClient = () => {
  const intl = useTranslations('Form');

  return z.object({
    name: z.string().min(1, { message: intl('requiredField') }),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    companyName: z.string().optional(),
    contactPerson: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
  });
};
