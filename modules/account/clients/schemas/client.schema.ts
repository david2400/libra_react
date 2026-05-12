import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationClient = () => {
  const v = useValidationMessages();

  return z.object({
    name: z.string().min(1, { message: v.required }),
    email: z
      .string()
      .email({ message: v.invalidEmail })
      .optional()
      .or(z.literal('')),
    phone: z.string().optional(),
    companyName: z.string().optional(),
    contactPerson: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
  });
};
