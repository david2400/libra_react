import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationApplication = () => {
  const v = useValidationMessages();

  return z.object({
    name: z.string().min(1, { message: v.required }),
    description: z.string().optional(),
    route: z.string().min(1, { message: v.required }),
    publication_date: z.string().min(1, { message: v.required }),
    company_id: z.number().optional(),
    maintenance_mode: z.boolean().optional(),
  });
};
