import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationClient = () => {
  const v = useValidationMessages();

  return z.object({
    // Campos obligatorios
    first_name: z.string().min(1, { message: v.required }),
    first_last_name: z.string().min(1, { message: v.required }),
    type_id: z.string().min(1, { message: v.required }),
    card_id: z.string().min(1, { message: v.required }),
    sex: z.string().min(1, { message: v.required }),
    gender: z.string().min(1, { message: v.required }),
    status: z.string().optional(),
    
    // Campos opcionales
    second_name: z.string().optional().or(z.literal('')),
    second_last_name: z.string().optional().or(z.literal('')),
    
    // Campo para update
    id_client: z.number().optional(),
  });
};
