import { useTranslations } from 'next-intl';
import { z } from 'zod';

export const validationModuleApplication = () => {
  const intl = useTranslations('Form');

  return z.object({
    moduleId: z.coerce
      .number({ invalid_type_error: intl('requiredField') })
      .int()
      .positive({ message: intl('requiredField') }),
    applicationId: z.coerce
      .number({ invalid_type_error: intl('requiredField') })
      .int()
      .positive({ message: intl('requiredField') }),
    isActive: z.boolean().optional(),
  });
};
