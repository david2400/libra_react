# User-Companies Module

## 📋 Descripción

Módulo para gestionar la asignación de empresas a usuarios. Permite asignar múltiples empresas a un usuario y definir cuál es la empresa principal.

## 🏗️ Estructura

```
user-companies/
├── components/
│   ├── user-company-manager.tsx  # Componente principal con tabla y métricas
│   └── form.tsx                   # Formularios de creación y edición
├── models/
│   └── user-company.interface.ts # Interfaces TypeScript
├── scenes/
│   └── formUserCompany.tsx       # Formulario reutilizable
├── schemas/
│   └── user-company.schema.ts    # Validaciones con Zod
├── index.ts                       # Exportaciones públicas
└── README.md                      # Documentación
```

## 🎯 Características

### ✅ Funcionalidades Implementadas

- **CRUD Completo**: Crear, leer, actualizar asignaciones
- **Gestión Multi-empresa**: Un usuario puede tener múltiples empresas
- **Empresa Principal**: Marcar una empresa como principal
- **Estados**: Activar/desactivar asignaciones
- **Métricas en Tiempo Real**: 
  - Total de asignaciones
  - Asignaciones activas
  - Usuarios con empresas
  - Asignaciones principales

### 🎨 UI/UX

- **Diseño Empresarial Moderno**: Gradientes y sombras profesionales
- **Tarjetas de Métricas**: Con iconos y gradientes de colores
- **Tabla Interactiva**: Con filtros y ordenamiento
- **Badges de Estado**: Visual feedback claro
- **Modales**: Para crear y editar asignaciones
- **Responsive**: Adaptado a móvil y desktop

## 📊 Modelos de Datos

### IUserCompany
```typescript
interface IUserCompany {
  id_user_company?: number;
  user_id: number;
  company_id: number;
  is_primary?: boolean;
  assigned_date?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}
```

### IUserCompanyWithDetails
```typescript
interface IUserCompanyWithDetails extends IUserCompany {
  user_name?: string;
  company_name?: string;
  company_nit?: string;
}
```

## 🔧 Uso

### Importar el componente

```typescript
import { UserCompanyManager } from "@/modules/account/user-companies";
```

### Ejemplo de uso

```tsx
<UserCompanyManager
  initialData={userCompaniesData}
  users={usersData}
  companies={companiesData}
/>
```

## 🚀 Próximos Pasos

### Pendiente de Implementación

1. **Server Actions**: Crear acciones del servidor en:
   - `app/[locale]/(protected)/account/user-companies/actions.ts`

2. **Backend API**: Implementar endpoints en:
   - `server/domains/access-control/account/user-companies/`

3. **Página**: Crear página en:
   - `app/[locale]/(protected)/account/user-companies/page.tsx`

4. **Traducciones**: Agregar en:
   - `messages/[locale].json` bajo `account.userCompanies`

## 📝 Ejemplo de Server Actions

```typescript
// app/[locale]/(protected)/account/user-companies/actions.ts
'use server';

export async function createUserCompanyServerAction(payload: IUserCompanyCreateRequest) {
  // Implementar lógica
}

export async function updateUserCompanyServerAction(id: number, payload: IUserCompanyUpdateRequest) {
  // Implementar lógica
}

export async function deleteUserCompanyServerAction(id: number) {
  // Implementar lógica
}
```

## 🎨 Paleta de Colores

- **Azul/Cyan**: Total Asignaciones
- **Esmeralda/Teal**: Asignaciones Activas
- **Violeta/Púrpura**: Usuarios con Empresas
- **Ámbar/Naranja**: Asignaciones Principales

## 📖 Traducciones Requeridas

```json
{
  "account": {
    "userCompanies": {
      "title": "Asignación de Empresas",
      "description": "Gestiona las empresas asignadas a cada usuario",
      "fields": {
        "user": "Usuario",
        "company": "Empresa",
        "is_primary": "Empresa Principal",
        "status": "Estado"
      },
      "messages": {
        "createSuccess": "Asignación creada exitosamente",
        "updateSuccess": "Asignación actualizada exitosamente"
      }
    }
  }
}
```

## 🔗 Dependencias

- React Table (@tanstack/react-table)
- React Hook Form
- Zod (validaciones)
- SweetAlert2
- HeroIcons v2
- Next.js 16+
- next-intl (traducciones)
