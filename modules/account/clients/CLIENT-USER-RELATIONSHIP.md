# Relación Client - Users (1:N)

## 📊 Modelo de Datos

### Relación en el Backend

```
┌─────────────────────────┐
│       Client            │
│  (ClientsEntity)        │
├─────────────────────────┤
│ id_client (PK)          │
│ first_name              │
│ second_name             │
│ first_last_name         │
│ second_last_name        │
│ type_id                 │
│ card_id                 │
│ sex                     │
│ gender                  │
│ status                  │
└───────────┬─────────────┘
            │
            │ 1:N
            │ @OneToMany
            │
            ▼
┌─────────────────────────┐
│        User             │
│   (UserEntity)          │
├─────────────────────────┤
│ id_user (PK)            │
│ username                │
│ password                │
│ client_id (FK) ◄────────┘
│ company_id              │
│ status                  │
│ last_login              │
│ refresh_token           │
└─────────────────────────┘
```

### Interpretación

- **Un Cliente puede tener VARIOS Usuarios**
- **Un Usuario pertenece a UN SOLO Cliente**
- La relación se establece mediante `client_id` en la tabla `User`

## 🎯 Implementación en el Frontend

### 1. Tipos TypeScript

```typescript
// IClient - Representa una persona física
export interface IClient extends IAuditInfo {
  id_client: number;
  first_name: string;
  second_name?: string;
  first_last_name: string;
  second_last_name?: string;
  type_id: string;
  card_id: string;
  sex: string;
  gender: string;
  status: string;
}

// IUser - Representa una cuenta de acceso al sistema
export interface IUser extends IAuditInfo {
  id_user: number;
  username: string;
  password: string;
  client_id: number;  // ← FK hacia Client
  company_id?: number;
  status: string;
  last_login?: string;
  refresh_token?: string;
}
```

### 2. Flujo de Datos

```
ClientManager
    │
    ├─ Recibe: initialData (clients[])
    ├─ Recibe: initialUsers (users[])
    │
    ├─ Calcula métricas:
    │   ├─ Total clientes
    │   ├─ Clientes activos
    │   ├─ Total usuarios (todos)
    │   └─ Usuarios activos (todos)
    │
    └─ Por cada cliente en la tabla:
        └─ Muestra: cantidad de usuarios asociados
            (filtrando users por client_id)
```

### 3. Visualización en ClientManager

```tsx
// En la columna de nombre, se muestra:
┌──────────────────────────────────────┐
│ Juan Carlos Pérez García             │
│ CC: 1234567890 • 3 usuarios          │ ← Cantidad de usuarios
└──────────────────────────────────────┘
```

### 4. Gestión de Usuarios por Cliente

Cuando se hace click en un cliente:

```
ClientDetailModal
    │
    ├─ Tab "Información"
    │   └─ Editar datos del cliente
    │
    └─ Tab "Usuarios"
        │
        └─ ClientUsersSection
            │
            ├─ Filtra users por client_id
            │
            ├─ Muestra estadísticas:
            │   ├─ Total usuarios de este cliente
            │   ├─ Usuarios activos
            │   └─ Usuarios inactivos
            │
            └─ Permite:
                ├─ Crear nuevo usuario (con client_id automático)
                ├─ Editar usuario existente
                ├─ Eliminar usuario
                └─ Activar/Desactivar usuario
```

## 💡 Casos de Uso

### Caso 1: Cliente con Múltiples Usuarios

```
Cliente: Juan Pérez (id_client: 1)
    ├─ Usuario: juan.perez@empresa.com (id_user: 101)
    ├─ Usuario: jperez.admin@empresa.com (id_user: 102)
    └─ Usuario: perez.support@empresa.com (id_user: 103)
```

**Escenario:** Una persona (cliente) puede tener diferentes cuentas de usuario para diferentes propósitos (personal, administrativo, soporte).

### Caso 2: Cliente sin Usuarios

```
Cliente: María López (id_client: 2)
    └─ (Sin usuarios asignados)
```

**Escenario:** Un cliente registrado pero que aún no tiene cuentas de acceso al sistema.

### Caso 3: Usuarios Compartiendo Cliente

```
Cliente: Empresa ABC S.A. (id_client: 3)
    ├─ Usuario: gerente@abc.com (id_user: 201)
    ├─ Usuario: contador@abc.com (id_user: 202)
    ├─ Usuario: vendedor1@abc.com (id_user: 203)
    └─ Usuario: vendedor2@abc.com (id_user: 204)
```

**Escenario:** Múltiples empleados de una empresa comparten el mismo cliente corporativo.

## 🔄 Operaciones CRUD

### Crear Usuario para un Cliente

```typescript
// 1. Usuario selecciona un cliente
const client = { id_client: 1, first_name: "Juan", ... };

// 2. Abre modal de usuarios
<ClientDetailModal client={client} />

// 3. Click en "Agregar Usuario"
<ClientUsersSection clientId={1} />

// 4. Formulario pre-llena client_id
const newUser = {
  username: "nuevo.usuario",
  password: "********",
  client_id: 1,  // ← Automático
  status: "active"
};

// 5. Server action crea el usuario
await createUserAction(newUser);
```

### Listar Usuarios de un Cliente

```typescript
// Hook personalizado filtra automáticamente
const { users, stats } = useClientUsers(clientId);

// Internamente hace:
const clientUsers = allUsers.filter(u => u.client_id === clientId);

// Retorna:
// - users: solo los del cliente
// - stats: { total, active, inactive }
```

### Actualizar Usuario

```typescript
// El client_id NO cambia
const updatedUser = {
  id_user: 101,
  username: "nuevo.nombre",
  status: "inactive",
  client_id: 1  // ← Se mantiene igual
};

await updateUserAction(101, updatedUser);
```

### Eliminar Usuario

```typescript
// Solo elimina el usuario, no afecta al cliente
await deleteUserAction(101);

// El cliente sigue existiendo
// Solo se reduce el contador de usuarios
```

## 📊 Métricas y Estadísticas

### Nivel Global (ClientManager)

```typescript
{
  totalClients: 150,        // Total de clientes
  activeClients: 142,       // Clientes con status='active'
  totalUsers: 450,          // Total de usuarios en el sistema
  activeUsers: 398          // Usuarios con status='active'
}
```

### Nivel Cliente (ClientUsersSection)

```typescript
// Para client_id = 1
{
  total: 5,      // Total de usuarios de este cliente
  active: 4,     // Usuarios activos de este cliente
  inactive: 1    // Usuarios inactivos de este cliente
}
```

## 🎨 Visualización en la UI

### ClientManager - Vista de Lista

```
┌────────────────────────────────────────────────────────────┐
│ Métricas Globales                                          │
├────────────────────────────────────────────────────────────┤
│ Total Clientes: 150  │  Clientes Activos: 142             │
│ Total Usuarios: 450  │  Usuarios Activos: 398             │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Nombre                    │ Sexo │ Género │ Identificación │
├────────────────────────────────────────────────────────────┤
│ Juan Carlos Pérez García  │  M   │ Masc.  │ CC: 123456    │
│ CC: 123456 • 5 usuarios   │      │        │               │
├────────────────────────────────────────────────────────────┤
│ María José López Martínez │  F   │ Fem.   │ CC: 789012    │
│ CC: 789012 • 0 usuarios   │      │        │               │
└────────────────────────────────────────────────────────────┘
```

### ClientDetailModal - Vista Detallada

```
┌────────────────────────────────────────────────────────────┐
│ Juan Carlos Pérez García                                   │
├────────────────────────────────────────────────────────────┤
│ [Información] [Usuarios]                                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Usuarios de Juan Carlos Pérez García                      │
│                                                            │
│ Total: 5  │  Activos: 4  │  Inactivos: 1                 │
│                                                            │
│ ┌────────────────────────────────────────────────────┐   │
│ │ Usuario              │ Último Acceso │ Estado      │   │
│ ├────────────────────────────────────────────────────┤   │
│ │ juan.perez          │ 2026-06-03    │ Activo      │   │
│ │ jperez.admin        │ 2026-06-02    │ Activo      │   │
│ │ perez.support       │ 2026-05-30    │ Activo      │   │
│ │ juan.backup         │ 2026-05-15    │ Activo      │   │
│ │ perez.old           │ 2025-12-20    │ Inactivo    │   │
│ └────────────────────────────────────────────────────┘   │
│                                                            │
│ [+ Agregar Usuario]                                        │
└────────────────────────────────────────────────────────────┘
```

## 🔐 Reglas de Negocio

### Validaciones

1. **Al crear usuario:**
   - ✅ `client_id` es obligatorio
   - ✅ `client_id` debe existir en la tabla Clients
   - ✅ `username` debe ser único en el sistema

2. **Al eliminar cliente:**
   - ⚠️ Verificar si tiene usuarios asociados
   - ⚠️ Decidir: ¿Eliminar usuarios en cascada o prevenir eliminación?

3. **Al desactivar cliente:**
   - 💡 Opción: Desactivar automáticamente todos sus usuarios
   - 💡 Opción: Mantener usuarios activos independientemente

### Integridad Referencial

```sql
-- En el backend (Java/JPA)
@ManyToOne
@JoinColumn(name = "client_id", nullable = false)
private ClientsEntity client;

-- Garantiza que:
-- 1. No se puede crear usuario sin cliente
-- 2. No se puede eliminar cliente con usuarios (o se eliminan en cascada)
-- 3. client_id siempre apunta a un cliente válido
```

## 📝 Mejores Prácticas

### 1. Siempre Validar client_id

```typescript
// ✅ Bueno
const createUser = async (data: ICreateUser) => {
  if (!data.client_id) {
    throw new Error('client_id es obligatorio');
  }
  return await createUserAction(data);
};

// ❌ Malo
const createUser = async (data: ICreateUser) => {
  return await createUserAction(data); // Puede fallar en el backend
};
```

### 2. Filtrar Usuarios por Cliente

```typescript
// ✅ Bueno: Usar hook personalizado
const { users } = useClientUsers(clientId);

// ❌ Malo: Filtrar manualmente cada vez
const clientUsers = allUsers.filter(u => u.client_id === clientId);
```

### 3. Mantener Sincronización

```typescript
// ✅ Bueno: Actualizar estado al crear usuario
<ClientUsersSection
  onUserCreated={(user) => {
    setUsers(prev => [...prev, user]);
  }}
/>

// ❌ Malo: No actualizar, requiere refresh
<ClientUsersSection />
```

## 🚀 Extensiones Futuras

### 1. Roles por Usuario-Cliente

```typescript
interface IUserClientRole {
  user_id: number;
  client_id: number;
  role: 'admin' | 'user' | 'viewer';
}
```

### 2. Permisos Específicos

```typescript
interface IUserClientPermissions {
  user_id: number;
  client_id: number;
  permissions: string[];
}
```

### 3. Historial de Actividad

```typescript
interface IUserClientActivity {
  user_id: number;
  client_id: number;
  action: string;
  timestamp: Date;
}
```
