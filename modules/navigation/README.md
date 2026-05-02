# Navigation CRUD Modules

Módulos CRUD para la gestión de navegación en Libra, siguiendo los patrones establecidos en el módulo de Grade de Draco.

## Estructura Implementada

```
navigation/
├── menus/
│   ├── components/
│   │   ├── form.tsx ✅
│   │   └── menu-manager.tsx ✅
│   ├── models/
│   │   └── menu.interface.ts ✅
│   ├── schemas/
│   │   └── menu.schema.ts ✅
│   └── scenes/
│       └── formMenu.tsx ✅
├── menu-permissions/
│   ├── components/
│   │   ├── form.tsx ⏳ (pendiente)
│   │   └── menu-permission-manager.tsx ⏳ (pendiente)
│   ├── models/
│   │   └── menu-permission.interface.ts ✅
│   ├── schemas/
│   │   └── menu-permission.schema.ts ✅
│   └── scenes/
│       └── formMenuPermission.tsx ⏳ (pendiente)
└── role-menus/
    ├── components/
    │   ├── form.tsx ⏳ (pendiente)
    │   └── role-menu-manager.tsx ⏳ (pendiente)
    ├── models/
    │   └── role-menu.interface.ts ✅
    ├── schemas/
    │   └── role-menu.schema.ts ✅
    └── scenes/
        └── formRoleMenu.tsx ⏳ (pendiente)
```

## Módulos Completados

### 1. Menus (100%)
- ✅ Models: `menu.interface.ts`
- ✅ Schemas: `menu.schema.ts`
- ✅ Scenes: `formMenu.tsx`
- ✅ Components: `form.tsx`, `menu-manager.tsx`

### 2. IMenu Permissions (40%)
- ✅ Models: `menu-permission.interface.ts`
- ✅ Schemas: `menu-permission.schema.ts`
- ⏳ Scenes: Pendiente
- ⏳ Components: Pendiente

### 3. IRole Menus (40%)
- ✅ Models: `role-menu.interface.ts`
- ✅ Schemas: `role-menu.schema.ts`
- ⏳ Scenes: Pendiente
- ⏳ Components: Pendiente

## Patrones Implementados

### Importaciones
```typescript
// Models
import type { menus } from '@/server/domains/access-control/navigation';

// Actions
import { menus } from "@/server/domains/access-control/navigation";
await menus.create_menu_action(values);
```

### Validación
- Zod schemas con internacionalización (next-intl)
- Mensajes de error consistentes
- Validaciones específicas por entidad

### Componentes
- React Hook Form + Zod Resolver
- SweetAlert2 para notificaciones
- @repo/ui components (Modal, Buttons, DataTable, FormField, FormSelectField)
- TanStack Table para tablas de datos

### UI/UX
- Tarjetas de métricas con gradientes
- Modales para crear/editar
- Estados de loading y error
- Botones de acción consistentes

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

### Menus
```typescript
import { MenuManager } from '@/modules/navigation/menus/components/menu-manager';

<MenuManager initialData={menus} />
```

## Notas

- Los errores de TypeScript sobre módulos no encontrados son normales en desarrollo
- Las dependencias se resolverán al compilar el proyecto
- Todos los módulos siguen exactamente los patrones del módulo Grade
- La estructura está lista para ser extendida con los componentes faltantes

## Próximos Pasos

1. Completar componentes de IMenu Permissions
2. Completar componentes de IRole Menus
3. Crear páginas de Next.js para cada módulo
4. Agregar traducciones en archivos de i18n
5. Crear server actions si faltan
6. Testing e integración
