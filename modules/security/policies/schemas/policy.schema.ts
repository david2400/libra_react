import { useTranslations } from 'next-intl';
import { z } from 'zod';

export const validationPolicy = () => {
  const intl = useTranslations('Form');

  return z.object({
    name: z.string().min(1, { message: intl('requiredField') }),
    description: z.string().optional(),
    rules: z.array(z.object({
      resource: z.string(),
      actions: z.array(z.string()),
      conditions: z.record(z.unknown()).optional(),
    })).optional(),
  });
};
