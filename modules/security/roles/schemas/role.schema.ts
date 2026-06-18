import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationRole = () => {
  const v = useValidationMessages();

  return z.object({
    name: z.string().min(1, { message: v.required }),
    description: z.string().min(1, { message: v.required }),
    manage_users: z.boolean(),
    requires_approval: z.boolean().optional(),
    application_id: z.number().min(1, { message: v.required }),
    // approval_workflow: z.record(z.any()).optional(),
    // status: z.string().min(1, { message: v.required }),
  });
};
