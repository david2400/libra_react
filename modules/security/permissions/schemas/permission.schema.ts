import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationPermission = () => {
  const v = useValidationMessages();

  return z.object({
    // Información Básica
    name: z.string().min(1, { message: v.required }),
    description: z.string().optional(),
    
    // Tipo y Definición del Permiso
    permission_type: z.enum(['API', 'APPLICATION', 'UI', 'SYSTEM'], { 
      required_error: v.required 
    }),
    resource: z.string().min(1, { message: v.required }),
    action: z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE', 'VIEW', 'MANAGE', 'ADMIN', 'APPROVE', 'REJECT'], {
      required_error: v.required 
    }),
    
    // Asignación a Aplicación y Módulo
    application_id: z.number().optional(),
    module_id: z.number().optional(),
    
    // Configuración Específica por Tipo
    api_type: z.enum(['REST', 'GraphQL', 'gRPC', 'SOAP', 'WebSockets', 'RPC (general)']).optional(),
    http_method: z.string().max(10).optional(),
    endpoint_path: z.string().max(500).optional(),
    ui_component: z.string().max(200).optional(),
    feature_flag: z.string().max(100).optional(),
    
    // Configuración de Rendimiento y Seguridad
    priority: z.number().int().min(0).default(0),
    cache_ttl: z.number().int().min(0).default(3600),
    is_sensitive: z.boolean().default(false),
    
    // Metadata
    metadata: z.string().optional(),
  });
};
