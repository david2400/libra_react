import { useTranslations } from 'next-intl';
import { z } from 'zod';

export const validationCompanyApplication = () => {
  const intl = useTranslations('validation');

  return z.object({
    // Company Selection
    company_id: z.coerce
      .number({ invalid_type_error: intl('requiredField') })
      .int()
      .positive({ message: intl('requiredField') }),

    // Application Selection  
    application_id: z.coerce
      .number({ invalid_type_error: intl('requiredField') })
      .int()
      .positive({ message: intl('requiredField') }),

    // License Dates
    license_start_date: z.string()
      .min(1, { message: intl('requiredField') })
      .refine((date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
      }, { message: 'Fecha de inicio inválida' }),

    license_end_date: z.string()
      .min(1, { message: intl('requiredField') })
      .refine((date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
      }, { message: 'Fecha de fin inválida' }),

    // Status
    is_active: z.boolean().default(true),

    // Optional Fields
    user_limit: z.coerce
      .number({ invalid_type_error: 'Debe ser un número válido' })
      .int()
      .positive({ message: 'El límite de usuarios debe ser positivo' })
      .optional(),

    subscription_type: z.string()
      .max(100, { message: 'Máximo 100 caracteres' })
      .optional(),

    auto_renew: z.boolean().default(false),

    notes: z.string()
      .max(1000, { message: 'Máximo 1000 caracteres' })
      .optional(),
  });
};
