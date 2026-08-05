import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationApplication = () => {
  const v = useValidationMessages();

  return z.object({
    name: z.string().min(1, { message: v.required }),
    description: z.string().optional(),
    publication_date: z.string().min(1, { message: v.required }),
    maintenance_mode: z.boolean().optional(),
    application_category_id: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .transform((val) => {
        if (val === undefined || val === null) return null;
        if (typeof val === 'number') return val;
        return val ? Number(val) : null;
      }),
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
    application_category_id: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .transform((val) => {
        if (val === undefined || val === null) return null;
        if (typeof val === 'number') return val;
        return val ? Number(val) : null;
      }),
  });
};
