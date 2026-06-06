# Módulo de Gestión de Clientes y Usuarios

Este módulo implementa una solución escalable y mantenible para gestionar clientes y sus usuarios asociados, siguiendo los principios SOLID.

## 🏗️ Arquitectura

### Principios SOLID Aplicados

#### 1. **Single Responsibility Principle (SRP)**
Cada componente tiene una única responsabilidad:

- `ClientManager`: Gestiona la lista de clientes
- `ClientDetailModal`: Maneja la vista detallada de un cliente
- `ClientUsersSection`: Gestiona usuarios de un cliente específico
- `useClientUsers`: Hook que maneja la lógica de usuarios

#### 2. **Open/Closed Principle (OCP)**
Los componentes son extensibles sin modificación:

```tsx
// Extensible mediante props
<ClientUsersSection
  clientId={1}
  clientName="Acme Corp"
  onUserCreated={(user) => console.log('Usuario creado', user)}
  onUserUpdated={(user) => console.log('Usuario actualizado', user)}
/>
```

#### 3. **Liskov Substitution Principle (LSP)**
Los componentes pueden ser reemplazados por variantes sin romper la funcionalidad.

#### 4. **Interface Segregation Principle (ISP)**
Interfaces específicas para cada caso de uso:

```typescript
interface ClientUsersSectionProps {
  clientId: number;
  clientName: string;
  initialUsers?: IUser[];
  onUserCreated?: (user: IUser) => void;
  onUserUpdated?: (user: IUser) => void;
  onUserDeleted?: (userId: number) => void;
}
```

#### 5. **Dependency Inversion Principle (DIP)**
Los componentes dependen de abstracciones (props, hooks) no de implementaciones concretas.

## 📁 Estructura del Módulo

```
modules/account/clients/
├── components/
│   ├── client-manager.tsx          # Componente principal
│   ├── client-detail-modal.tsx     # Modal con tabs (Info + Usuarios)
│   ├── client-users-section.tsx    # Sección de gestión de usuarios
│   └── form.tsx                     # Formularios de cliente
├── hooks/
│   └── use-client-users.ts         # Hook para lógica de usuarios
├── models/
│   └── client.interface.ts         # Tipos de cliente
├── schemas/
│   └── client.schema.ts            # Validaciones Zod
├── index.ts                         # Exports públicos
└── README.md                        # Este archivo
```

## 🚀 Uso

### Uso Básico

```tsx
import { ClientManager } from '@/modules/account/clients';

export default function ClientsPage() {
  const clients = await getClients();
  const users = await getUsers();

  return (
    <ClientManager 
      initialData={clients} 
      initialUsers={users}
    />
  );
}
```

### Uso del Modal Detallado

```tsx
import { ClientDetailModal } from '@/modules/account/clients';

function MyComponent() {
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ClientDetailModal
      client={selectedClient}
      open={isOpen}
      onClose={() => setIsOpen(false)}
      initialUsers={users}
      onUserCreated={(user) => {
        console.log('Nuevo usuario:', user);
      }}
    />
  );
}
```

### Uso del Hook

```tsx
import { useClientUsers } from '@/modules/account/clients';

function MyComponent({ clientId }: { clientId: number }) {
  const {
    users,
    stats,
    isLoading,
    addUser,
    updateUser,
    removeUser,
    toggleUserStatus,
  } = useClientUsers(clientId);

  return (
    <div>
      <p>Total usuarios: {stats.total}</p>
      <p>Activos: {stats.active}</p>
      <p>Inactivos: {stats.inactive}</p>
    </div>
  );
}
```

## 🎯 Características

### ✅ Gestión Integrada
- Ver y editar información del cliente
- Gestionar usuarios del cliente en el mismo modal
- Tabs para organizar la información

### ✅ Operaciones CRUD
- Crear usuarios rápidamente desde el cliente
- Editar usuarios existentes
- Eliminar usuarios
- Activar/Desactivar usuarios

### ✅ Estadísticas en Tiempo Real
- Total de usuarios por cliente
- Usuarios activos vs inactivos
- Métricas visuales

### ✅ Formularios Optimizados
- Formularios rápidos para crear/editar usuarios
- Validación en tiempo real
- Feedback visual de estados

## 🔄 Flujo de Datos

```
ClientManager
    ↓
ClientDetailModal (Tabs)
    ├── Tab Info → UpdateClient Form
    └── Tab Users → ClientUsersSection
                        ↓
                    useClientUsers Hook
                        ↓
                    Server Actions
```

## 🎨 Componentes Visuales

### ClientManager
- Lista de clientes con DataTable
- Métricas generales
- Botón para crear nuevo cliente
- Click en cliente abre modal detallado

### ClientDetailModal
- **Tab Información**: Formulario de edición del cliente
- **Tab Usuarios**: Gestión completa de usuarios
  - Lista de usuarios del cliente
  - Estadísticas (Total, Activos, Inactivos)
  - Botón para agregar usuario
  - Acciones por usuario (Editar, Eliminar)

### ClientUsersSection
- DataTable con usuarios del cliente
- Cards de estadísticas
- Estado vacío con CTA
- Modales para crear/editar usuarios

## 🛠️ Extensibilidad

### Agregar Nuevas Funcionalidades

#### 1. Nuevo Tab en ClientDetailModal

```tsx
const tabs = [
  { id: 'info', label: 'Información', icon: HiOutlineInformationCircle },
  { id: 'users', label: 'Usuarios', icon: HiOutlineUserGroup },
  { id: 'settings', label: 'Configuración', icon: HiOutlineCog }, // Nuevo
];
```

#### 2. Nuevas Acciones en useClientUsers

```tsx
export function useClientUsers(clientId?: number) {
  // ... código existente
  
  const bulkActivateUsers = useCallback(async (userIds: number[]) => {
    // Implementación
  }, []);

  return {
    // ... retornos existentes
    bulkActivateUsers, // Nueva función
  };
}
```

#### 3. Nuevas Columnas en la Tabla

```tsx
const columns: ColumnDef<IUser>[] = [
  // ... columnas existentes
  {
    accessorKey: "created_at",
    header: "Fecha de creación",
    cell: (info) => formatDate(info.getValue<string>()),
  },
];
```

## 📝 Notas Importantes

1. **Server Actions**: Los componentes usan imports dinámicos para evitar problemas con `next/headers`
2. **TypeScript**: Todos los componentes están completamente tipados
3. **Accesibilidad**: Los componentes siguen las mejores prácticas de a11y
4. **Responsive**: Diseño adaptable a diferentes tamaños de pantalla
5. **i18n**: Soporte completo para internacionalización

## 🔐 Seguridad

- Validación de permisos en server actions
- Sanitización de inputs
- Confirmación para acciones destructivas
- Manejo seguro de contraseñas

## 🧪 Testing

```tsx
// Ejemplo de test
describe('ClientUsersSection', () => {
  it('should display users for a client', () => {
    render(
      <ClientUsersSection
        clientId={1}
        clientName="Test Client"
        initialUsers={mockUsers}
      />
    );
    
    expect(screen.getByText('Test Client')).toBeInTheDocument();
  });
});
```

## 📚 Recursos Adicionales

- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
