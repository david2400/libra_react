import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationCompany = () => {
  const v = useValidationMessages();

  return z.object({
    // Información Básica
    name: z.string().min(1, { message: v.required }),
    nit: z.string().min(1, { message: v.required }),
    active_date: z.string().min(1, { message: v.required }),
    status: z.string().min(1, { message: v.required }),
    
    // Información de Contacto
    email: z.string().email({ message: v.invalidEmail }).optional().or(z.literal('')),
    phone: z.string().optional(),
    website: z.string().url({ message: v.invalidUrl }).optional().or(z.literal('')),
    contact_person: z.string().optional(),
    
    // Dirección
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    postal_code: z.string().optional(),
    
    // Datos Fiscales y Legales
    legal_representative: z.string().optional(),
    tax_regime: z.string().optional(),
    economic_activity: z.string().optional(),
    employee_count: z.number().int().min(0).optional(),
    
    // Configuración y Estado
    timezone: z.string().optional(),
    currency: z.string().optional(),
    language: z.string().optional(),
    verification_date: z.string().optional(),
    is_active: z.boolean().optional(),
    is_verified: z.boolean().optional(),
    
    // Límites y Configuración del Plan
    max_users: z.number().int().min(0).optional(),
    max_applications: z.number().int().min(0).optional(),
    subscription_type: z.string().optional(),
    subscription_start_date: z.string().optional(),
    subscription_end_date: z.string().optional(),
  });
};
