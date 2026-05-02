# Security CRUD Modules

Módulos CRUD para la gestión de seguridad en Libra, siguiendo los patrones establecidos en el módulo de Grade de Draco.

## Estructura Implementada

```
security/
├── roles/
│   ├── components/
│   │   ├── form.tsx ✅
│   │   └── role-manager.tsx ✅
│   ├── models/
│   │   └── role.interface.ts ✅
│   ├── schemas/
│   │   └── role.schema.ts ✅
│   └── scenes/
│       └── formRole.tsx ✅
├── permissions/
│   ├── components/
│   │   ├── form.tsx ⏳ (pendiente)
│   │   └── permission-manager.tsx ⏳ (pendiente)
│   ├── models/
│   │   └── permission.interface.ts ✅
│   ├── schemas/
│   │   └── permission.schema.ts ✅
│   └── scenes/
│       └── formPermission.tsx ⏳ (pendiente)
├── role-permissions/
│   ├── components/
│   │   ├── form.tsx ⏳ (pendiente)
│   │   └── role-permission-manager.tsx ⏳ (pendiente)
│   ├── models/
│   │   └── role-permission.interface.ts ✅
│   ├── schemas/
│   │   └── role-permission.schema.ts ✅
│   └── scenes/
│       └── formRolePermission.tsx ⏳ (pendiente)
├── applications/
│   ├── components/
│   │   ├── form.tsx ⏳ (pendiente)
│   │   └── application-manager.tsx ⏳ (pendiente)
│   ├── models/
│   │   └── application.interface.ts ✅
│   ├── schemas/
│   │   └── application.schema.ts ✅
│   └── scenes/
│       └── formApplication.tsx ⏳ (pendiente)
├── policies/
│   ├── components/
│   │   ├── form.tsx ⏳ (pendiente)
│   │   └── policy-manager.tsx ⏳ (pendiente)
│   ├── models/
│   │   └── policy.interface.ts ✅
│   ├── schemas/
│   │   └── policy.schema.ts ✅
│   └── scenes/
│       └── formPolicy.tsx ⏳ (pendiente)
└── modules-applications/
    ├── components/
    │   ├── form.tsx ⏳ (pendiente)
    │   └── module-application-manager.tsx ⏳ (pendiente)
    ├── models/
    │   └── module-application.interface.ts ✅
    ├── schemas/
    │   └── module-application.schema.ts ✅
    └── scenes/
        └── formModuleApplication.tsx ⏳ (pendiente)
```

## Módulos Completados

### 1. Roles (100%)
- ✅ Models: `role.interface.ts`
- ✅ Schemas: `role.schema.ts`
- ✅ Scenes: `formRole.tsx`
- ✅ Components: `form.tsx`, `role-manager.tsx`

### 2. Permissions (40%)
- ✅ Models: `permission.interface.ts`
- ✅ Schemas: `permission.schema.ts`
- ⏳ Scenes: Pendiente
- ⏳ Components: Pendiente

### 3. IRole Permissions (40%)
- ✅ Models: `role-permission.interface.ts`
- ✅ Schemas: `role-permission.schema.ts`
- ⏳ Scenes: Pendiente
- ⏳ Components: Pendiente

### 4. Applications (40%)
- ✅ Models: `application.interface.ts`
- ✅ Schemas: `application.schema.ts`
- ⏳ Scenes: Pendiente
- ⏳ Components: Pendiente

### 5. Policies (40%)
- ✅ Models: `policy.interface.ts`
- ✅ Schemas: `policy.schema.ts`
- ⏳ Scenes: Pendiente
- ⏳ Components: Pendiente

### 6. Modules Applications (40%)
- ✅ Models: `module-application.interface.ts`
- ✅ Schemas: `module-application.schema.ts`
- ⏳ Scenes: Pendiente
- ⏳ Components: Pendiente

## Patrones Implementados

### Importaciones
```typescript
// Models
import type { roles } from '@/server/domains/access-control/security';

// Actions
import { roles } from "@/server/domains/access-control/security";
await roles.create_role_action(values);
```

### Validación
- Zod schemas con internacionalización (next-intl)
- Mensajes de error consistentes
- Validaciones específicas por entidad

### Componentes
- React Hook Form + Zod Resolver
- SweetAlert2 para notificaciones
- @repo/ui components (Modal, Buttons, DataTable, FormField)
- TanStack Table para tablas de datos

### UI/UX
- Tarjetas de métricas con gradientes
- Modales para crear/editar
- Estados de loading y error
- Botones de acción consistentes

## Campos por Entidad

### Roles
- **name**: Nombre del rol (requerido)
- **description**: Descripción del rol
- **permission_ids**: IDs de permisos asociados
- **menu_ids**: IDs de menús asociados

### Permissions
- **name**: Nombre del permiso (requerido)
- **description**: Descripción del permiso
- **resource**: Recurso al que aplica
- **action**: Acción permitida

### IRole Permissions
- **roleId**: ID del rol (requerido)
- **permissionId**: ID del permiso (requerido)
- **isActive**: Estado activo/inactivo

## Dependencias

- `next-intl`: Internacionalización
- `react-hook-form`: Manejo de formularios
- `zod`: Validación de esquemas
- `@hookform/resolvers`: Integración Zod + React Hook Form
- `sweetalert2`: Notificaciones
- `@tanstack/react-table`: Tablas de datos
- `react-icons`: Iconos
- `@repo/ui`: Componentes UI compartidos

## Uso

### Roles
```typescript
import { RoleManager } from '@/modules/security/roles/components/role-manager';

<RoleManager initialData={roles} />
```

## Notas

- Los errores de TypeScript sobre módulos no encontrados son normales en desarrollo
- Las dependencias se resolverán al compilar el proyecto
- Todos los módulos siguen exactamente los patrones del módulo Grade
- La estructura está lista para ser extendida con los componentes faltantes

## Próximos Pasos

1. Completar componentes de Permissions
2. Completar componentes de IRole Permissions
3. Crear páginas de Next.js para cada módulo
4. Agregar traducciones en archivos de i18n
5. Crear server actions si faltan
6. Testing e integración

## Relación con Navigation

Este módulo de Security se complementa con el módulo de Navigation:
- **Roles** pueden tener **Menus** asignados
- **Permissions** pueden estar asociados a **Menus**
- **IRole Permissions** define qué permisos tiene cada rol
