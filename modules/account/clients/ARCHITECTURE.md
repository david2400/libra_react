# Arquitectura del Módulo Integrado Clients-Users

## 📐 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                    (Browser / React Components)                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  ClientManager                                                   │
│  ├── DataTable (Clients List)                                   │
│  ├── Metrics Cards                                              │
│  └── ClientDetailModal ──────┐                                  │
│                               │                                  │
│  ClientDetailModal            │                                  │
│  ├── Tab: Info ───────────────┼──> UpdateClient Form            │
│  └── Tab: Users ──────────────┼──> ClientUsersSection           │
│                               │                                  │
│  ClientUsersSection           │                                  │
│  ├── Stats Cards              │                                  │
│  ├── DataTable (Users)        │                                  │
│  ├── UserQuickCreateForm      │                                  │
│  └── UserQuickEditForm        │                                  │
└───────────────────────────────┼──────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BUSINESS LOGIC LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│  useClientUsers Hook                                             │
│  ├── State Management (users, stats, loading, error)            │
│  ├── Filtering Logic (by client_id)                             │
│  ├── Statistics Calculation (total, active, inactive)           │
│  └── CRUD Operations                                             │
│      ├── loadUsers()                                             │
│      ├── addUser()                                               │
│      ├── updateUser()                                            │
│      ├── removeUser()                                            │
│      └── toggleUserStatus()                                      │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER ACTIONS LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│  app/[locale]/(protected)/account/users/actions.ts              │
│  ├── createUserAction()                                          │
│  ├── updateUserAction()                                          │
│  ├── deleteUserAction()                                          │
│  └── getUsersByClientAction()                                    │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          DATA ACCESS LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│  server/domains/access-control/account/users/                   │
│  ├── repository.ts                                               │
│  │   ├── list(params)                                            │
│  │   ├── getById(id)                                             │
│  │   ├── create(payload)                                         │
│  │   ├── update(id, payload)                                     │
│  │   └── delete(id)                                              │
│  ├── queries.ts (cached queries)                                 │
│  └── actions.ts (server mutations)                               │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                            API LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  /api/access_control/users                                       │
│  ├── GET    /api/access_control/users                            │
│  ├── GET    /api/access_control/users/:id                        │
│  ├── POST   /api/access_control/users                            │
│  ├── PUT    /api/access_control/users/:id                        │
│  └── DELETE /api/access_control/users/:id                        │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          DATABASE LAYER                          │
│                        (PostgreSQL / MySQL)                      │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

### Crear Usuario desde Cliente

```
User Action
    │
    ├─> Click "Agregar Usuario" en ClientUsersSection
    │
    ├─> UserQuickCreateForm se abre en Modal
    │
    ├─> Usuario llena formulario (username, password, status)
    │
    ├─> Submit Form
    │
    ├─> handleSubmit() ejecuta:
    │   │
    │   ├─> Dynamic Import: createUserAction
    │   │
    │   ├─> createUserAction({ username, password, client_id, status })
    │   │   │
    │   │   ├─> Server Action Layer
    │   │   │   │
    │   │   │   ├─> createUserServerAction(payload)
    │   │   │   │
    │   │   │   ├─> usersRepository.create(payload)
    │   │   │   │   │
    │   │   │   │   ├─> serverFetch.post('/api/access_control/users', payload)
    │   │   │   │   │
    │   │   │   │   └─> API Response
    │   │   │   │
    │   │   │   └─> Return user data
    │   │   │
    │   │   └─> Return to component
    │   │
    │   ├─> onSuccess(user) callback
    │   │   │
    │   │   ├─> Close modal
    │   │   │
    │   │   └─> onUserCreated(user) → Update parent state
    │   │
    │   └─> useClientUsers.addUser(user) → Update local state
    │
    └─> UI Updates
        │
        ├─> User appears in DataTable
        │
        └─> Stats update (total, active)
```

### Editar Cliente y Ver Usuarios

```
User Action
    │
    ├─> Click en fila de cliente en ClientManager
    │
    ├─> handleEdit(client) ejecuta:
    │   │
    │   ├─> setEditingClient(client)
    │   │
    │   └─> setOpenModalUpdate(true)
    │
    ├─> ClientDetailModal se abre
    │   │
    │   ├─> Props recibidas:
    │   │   ├─> client (datos del cliente)
    │   │   ├─> initialUsers (todos los usuarios)
    │   │   └─> callbacks (onUserCreated, etc.)
    │   │
    │   ├─> Tabs disponibles:
    │   │   │
    │   │   ├─> Tab "Información"
    │   │   │   └─> UpdateClient Form
    │   │   │
    │   │   └─> Tab "Usuarios"
    │   │       └─> ClientUsersSection
    │   │           │
    │   │           ├─> useClientUsers(clientId, initialUsers)
    │   │           │   │
    │   │           │   ├─> Filtra: users.filter(u => u.client_id === clientId)
    │   │           │   │
    │   │           │   └─> Calcula stats: { total, active, inactive }
    │   │           │
    │   │           ├─> Muestra DataTable con usuarios filtrados
    │   │           │
    │   │           └─> Permite crear/editar/eliminar usuarios
    │   │
    │   └─> Usuario puede cambiar entre tabs sin perder datos
    │
    └─> Al cerrar modal, cambios se reflejan en ClientManager
```

## 🎯 Principios SOLID Aplicados

### 1. Single Responsibility Principle (SRP)

```
ClientManager
└─> Responsabilidad: Gestionar lista de clientes
    ├─> Mostrar tabla de clientes
    ├─> Mostrar métricas generales
    └─> Abrir modal de detalle

ClientDetailModal
└─> Responsabilidad: Mostrar detalles del cliente con tabs
    ├─> Gestionar tabs (Info, Users)
    └─> Coordinar componentes hijos

ClientUsersSection
└─> Responsabilidad: Gestionar usuarios de UN cliente
    ├─> Mostrar lista de usuarios
    ├─> Mostrar estadísticas
    └─> CRUD de usuarios

useClientUsers
└─> Responsabilidad: Lógica de negocio de usuarios
    ├─> Filtrado por cliente
    ├─> Cálculo de estadísticas
    └─> Operaciones CRUD
```

### 2. Open/Closed Principle (OCP)

```typescript
// ✅ Extensible mediante props sin modificar el componente
<ClientUsersSection
  clientId={1}
  clientName="Acme"
  initialUsers={users}
  // Nuevas funcionalidades mediante callbacks
  onUserCreated={(user) => handleNewUser(user)}
  onUserUpdated={(user) => handleUpdateUser(user)}
  onUserDeleted={(id) => handleDeleteUser(id)}
  // Fácil agregar más callbacks sin cambiar el componente
/>
```

### 3. Liskov Substitution Principle (LSP)

```typescript
// Los formularios pueden ser intercambiados
<Modal>
  {isCreating ? (
    <UserQuickCreateForm {...props} />
  ) : (
    <UserQuickEditForm {...props} />
  )}
</Modal>
```

### 4. Interface Segregation Principle (ISP)

```typescript
// Interfaces específicas para cada caso
interface ClientUsersSectionProps {
  clientId: number;
  clientName: string;
  initialUsers?: IUser[];
  onUserCreated?: (user: IUser) => void;
  onUserUpdated?: (user: IUser) => void;
  onUserDeleted?: (userId: number) => void;
}

interface UserQuickCreateFormProps {
  clientId: number;
  onSuccess: (user: IUser) => void;
  onCancel: () => void;
}
```

### 5. Dependency Inversion Principle (DIP)

```typescript
// Los componentes dependen de abstracciones (props)
// no de implementaciones concretas

// ✅ Bueno: Inyección de dependencias
<ClientUsersSection
  onUserCreated={handleUserCreated}  // Abstracción
/>

// ❌ Malo: Dependencia directa
// ClientUsersSection internamente llama a una función global
```

## 📊 Ventajas de esta Arquitectura

### ✅ Separación de Responsabilidades
- Cada capa tiene una responsabilidad clara
- Fácil de entender y mantener
- Cambios aislados no afectan otras capas

### ✅ Reutilización
- `useClientUsers` puede usarse en otros componentes
- `ClientUsersSection` es independiente y reutilizable
- Formularios pueden usarse en diferentes contextos

### ✅ Testabilidad
```typescript
// Fácil de testear cada capa por separado
describe('useClientUsers', () => {
  it('should filter users by client', () => {
    const { result } = renderHook(() => 
      useClientUsers(1, mockUsers)
    );
    expect(result.current.users).toHaveLength(2);
  });
});
```

### ✅ Escalabilidad
```typescript
// Fácil agregar nuevas funcionalidades
const tabs = [
  { id: 'info', label: 'Información' },
  { id: 'users', label: 'Usuarios' },
  { id: 'billing', label: 'Facturación' },  // ← Nuevo tab
  { id: 'reports', label: 'Reportes' },     // ← Nuevo tab
];
```

### ✅ Mantenibilidad
- Código organizado y predecible
- Fácil encontrar y corregir bugs
- Documentación clara de responsabilidades

## 🔐 Seguridad

### Server Actions
```typescript
// ✅ Validación en server-side
export async function createUserAction(payload: ICreateUser) {
  // Validación de permisos
  // Sanitización de inputs
  // Validación de business rules
  return await usersRepository.create(payload);
}
```

### Imports Dinámicos
```typescript
// ✅ Evita exponer server-only code al cliente
const { createUserAction } = await import(
  "@/app/[locale]/(protected)/account/users/actions"
);
```

## 🚀 Performance

### Caching
- Queries cacheadas con React `cache()`
- Tags de revalidación para invalidar cache específico
- Lazy loading de componentes pesados

### Optimistic Updates
```typescript
// Actualización optimista en el hook
const addUser = useCallback((user: IUser) => {
  setUsers(prev => [...prev, user]);  // UI inmediata
  // Server sync en background
}, []);
```

## 📝 Próximas Mejoras

1. **Paginación en ClientUsersSection**
2. **Búsqueda y filtros avanzados**
3. **Bulk operations (activar/desactivar múltiples usuarios)**
4. **Exportar usuarios a CSV/Excel**
5. **Historial de cambios (audit log)**
6. **Notificaciones en tiempo real**
