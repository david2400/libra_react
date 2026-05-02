# Libra Server Data Access Layer

Capa de acceso a datos server-side optimizada para **Next.js 16 Server Components** y **Essenza Access Control API**.

## Arquitectura

```
server/
├── lib/                          # Infraestructura compartida
│   ├── env.ts                    # Variables de entorno (server-only)
│   ├── server-fetch.ts           # HTTP client con native fetch + Next.js cache
│   ├── cache-tags.ts             # Tags centralizados para revalidación on-demand
│   ├── types.ts                  # Tipos genéricos (ApiResponse, ListParams, ServerApiError)
│   └── index.ts                  # Barrel export
│
├── domains/                      # Separación por dominio de negocio
│   └── access-control/           # Dominio principal de control de acceso
│       ├── types.ts              # Tipos del dominio (modelos, DTOs)
│       ├── repository.ts         # Acceso a datos con cache tags
│       ├── queries.ts            # Funciones cacheadas con React.cache() para Server Components
│       ├── actions.ts            # Server Actions ('use server') para mutaciones
│       └── index.ts              # Barrel export del dominio
│
└── index.ts                      # Export principal de utilidades
```

## Características Específicas de Libra

### Access Control API
La estructura está diseñada específicamente para la API de Essenza Access Control con los siguientes recursos:

- **Users**: Gestión de usuarios y autenticación
- **Roles**: Definición de roles y asignación de permisos
- **Permissions**: Permisos granulares del sistema
- **Policies**: Políticas de autorización
- **Menus**: Navegación y menús por rol/usuario
- **Applications**: Aplicaciones del sistema
- **Clients**: Gestión de clientes
- **Companies**: Gestión de empresas
- **Profiles**: Perfiles de usuario predefinidos

### Autenticación
- Soporte para JWT tokens
- Refresh token mechanism
- Validación de tokens
- Health checks para client y employee authentication

### Autorización
- Sistema de políticas basado en reglas
- Verificación de permisos en tiempo real
- Menús dinámicos por rol/usuario

## Capas

### 1. `types.ts` — Tipos del dominio
Interfaces TypeScript para modelos, DTOs de creación/actualización y enums específicos del Access Control.

### 2. `repository.ts` — Acceso a datos
- Usa `serverFetch` (native `fetch` con integración Next.js cache)
- Configura `revalidate` (TTL en segundos) y `tags` por endpoint
- Datos estáticos (roles, permisos): TTL alto (300s)
- Datos dinámicos (usuarios, sesiones): TTL bajo (60s)
- Mutaciones: `revalidate: false` (sin cache)

### 3. `queries.ts` — Funciones de lectura para Server Components
- Envueltas en `React.cache()` para deduplicación dentro del mismo render
- Queries compuestas BFF (e.g. `getUserProfile`, `getSystemOverview`)
- Importar con `import 'server-only'` para prevenir uso en Client Components

### 4. `actions.ts` — Server Actions para mutaciones
- Marcadas con `'use server'`
- Retornan `ActionResult<T>` (discriminated union: `success | error`)
- Invalidan cache tags relevantes tras cada mutación
- Manejo de errores centralizado con `ServerApiError`

## Uso

### En un Server Component (lectura)

```tsx
// app/[locale]/(protected)/access-control/users/page.tsx
import { getUsers, getUserProfile } from '@/server/domains/access-control';

export default async function UsersPage() {
  const { data: users, meta } = await getUsers({ page: 1, per_page: 20 });

  return (
    <div>
      {users.map(user => <UserCard key={user.id} user={user} />)}
      <Pagination meta={meta} />
    </div>
  );
}
```

### En un Server Component (BFF composite query)

```tsx
// app/[locale]/(protected)/access-control/users/[id]/page.tsx
import { getUserProfile } from '@/server/domains/access-control';

export default async function UserDetailPage({ params }: { params: { id: number } }) {
  const { user, menus } = await getUserProfile(Number(params.id));

  return <UserProfileView user={user} menus={menus} />;
}
```

### En un Client Component (mutación via Server Action)

```tsx
'use client';

import { createUserAction } from '@/server/domains/access-control';

function CreateUserForm() {
  async function handleSubmit(formData: FormData) {
    const result = await createUserAction({
      email: formData.get('email') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
    });

    if (result.success) {
      // redirect or show success
    } else {
      // show result.error
    }
  }

  return <form action={handleSubmit}>...</form>;
}
```

## Cache Strategy

| Dato | TTL (s) | Justificación |
|------|---------|---------------|
| Roles, Permisos | 300 | Cambian raramente |
| Menús, Aplicaciones | 180 | Semi-estáticos |
| Policies, Profiles | 120 | Cambios moderados |
| Users, Clients | 60 | Datos activos |
| Sesión, Mutaciones | `false` | Siempre frescos |

## Revalidación On-Demand

Cada Server Action invalida los tags relevantes:

```ts
// Después de crear un usuario:
revalidateTag('access-control:users');

// Después de actualizar un rol específico:
revalidateTag('access-control:role:42');
```

## Seguridad

- **`server-only`**: Previene importación accidental en Client Components
- **Auth headers**: Se propagan automáticamente desde cookies de sesión
- **`LIBRA_API_BASE_URL`**: Variable server-only (sin `NEXT_PUBLIC_` prefix)
- **Error sanitization**: `ServerApiError` normaliza errores sin exponer detalles internos

## Convenciones

- Nombres de archivos: `kebab-case` para carpetas de dominio
- Tipos: prefijo `I` para interfaces, sufijo `Payload` para DTOs de entrada
- Actions: sufijo `Action` (e.g. `createUserAction`)
- Queries: prefijo `get` (e.g. `getUserById`)
- Cache tags: `access-control:entidad` o `access-control:entidad:id`

## Environment Variables

```bash
# API Configuration
LIBRA_API_BASE_URL=http://localhost:3001
# O alternativamente:
API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Development
DEV_API_PORT=3001
```

## Ejemplos de Uso

### Autenticación

```tsx
import { loginAction, refreshTokenAction } from '@/server/domains/access-control';

// Login
const loginResult = await loginAction({
  email: 'user@example.com',
  password: 'password123',
  clientType: 'employee'
});

// Refresh token
const refreshResult = await refreshTokenAction({
  refreshToken: 'refresh-token-here'
});
```

### Gestión de Usuarios

```tsx
import { getUsers, createUserAction, updateUserAction } from '@/server/domains/access-control';

// Listar usuarios
const users = await getUsers({ page: 1, per_page: 20 });

// Crear usuario
const createResult = await createUserAction({
  email: 'newuser@example.com',
  firstName: 'John',
  lastName: 'Doe',
  roleIds: [1, 2]
});

// Actualizar usuario
const updateResult = await updateUserAction(123, {
  firstName: 'Jane',
  isActive: true
});
```

### Gestión de Roles y Permisos

```tsx
import { getRoles, createRoleAction, getPermissions } from '@/server/domains/access-control';

// Listar roles con permisos
const roles = await getRoles({ include: 'permissions' });

// Crear rol con permisos
const roleResult = await createRoleAction({
  name: 'Admin',
  description: 'Administrator role',
  permissionIds: [1, 2, 3],
  menuIds: [1, 2]
});
```

### Autorización

```tsx
import { checkAuthorizationAction } from '@/server/domains/access-control';

// Verificar permiso
const authResult = await checkAuthorizationAction({
  userId: 123,
  resource: 'users',
  action: 'read'
});

if (authResult.success && authResult.data.authorized) {
  // Permitir acceso
}
```
