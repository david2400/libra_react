import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationApplication = () => {
  const v = useValidationMessages();

  return z.object({
    name: z.string().min(1, { message: v.required }),
    description: z.string().optional(),
    publication_date: z.string().min(1, { message: v.required }),
    maintenance_mode: z.boolean().optional(),
  });
};


export const validationUpdateApplication = () => {
  const v = useValidationMessages();

  return z.object({
    id_application: z.number().min(1, { message: v.required }),
    name: z.string().min(1, { message: v.required }),
    description: z.string().optional(),
    publication_date: z.string().min(1, { message: v.required }),
    maintenance_mode: z.boolean().optional(),
  });
};
