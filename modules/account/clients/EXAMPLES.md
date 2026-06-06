# Ejemplos de Uso del Módulo Clients-Users

## 📚 Tabla de Contenidos

1. [Uso Básico](#uso-básico)
2. [Uso Avanzado](#uso-avanzado)
3. [Personalización](#personalización)
4. [Integración con Páginas](#integración-con-páginas)
5. [Manejo de Errores](#manejo-de-errores)

## Uso Básico

### Ejemplo 1: Página de Clientes Simple

```tsx
// app/[locale]/(protected)/account/clients/page.tsx
import { ClientManager } from '@/modules/account/clients';
import { getClients } from '@/server/domains/access-control/account/clients';
import { getUsers } from '@/server/domains/access-control/account/users';

export default async function ClientsPage() {
  // Cargar datos en el servidor
  const clientsResponse = await getClients();
  const usersResponse = await getUsers();

  // Extraer datos de respuestas paginadas
  const clients = clientsResponse.content || [];
  const users = usersResponse.content || [];

  return (
    <main className='container mx-auto py-8'>
      <ClientManager 
        initialData={clients}
        initialUsers={users}
      />
    </main>
  );
}
```

### Ejemplo 2: Usar Solo el Hook

```tsx
'use client';

import { useClientUsers } from '@/modules/account/clients';

export function ClientUserStats({ clientId }: { clientId: number }) {
  const { stats, isLoading } = useClientUsers(clientId);

  if (isLoading) {
    return <div>Cargando estadísticas...</div>;
  }

  return (
    <div className='grid grid-cols-3 gap-4'>
      <div className='stat-card'>
        <h3>Total</h3>
        <p>{stats.total}</p>
      </div>
      <div className='stat-card'>
        <h3>Activos</h3>
        <p>{stats.active}</p>
      </div>
      <div className='stat-card'>
        <h3>Inactivos</h3>
        <p>{stats.inactive}</p>
      </div>
    </div>
  );
}
```

### Ejemplo 3: Usar Solo ClientUsersSection

```tsx
'use client';

import { ClientUsersSection } from '@/modules/account/clients';
import { useState } from 'react';

export function ClientDetailPage({ 
  client, 
  initialUsers 
}: { 
  client: IClient;
  initialUsers: IUser[];
}) {
  const [users, setUsers] = useState(initialUsers);

  return (
    <div className='space-y-6'>
      {/* Información del cliente */}
      <section>
        <h1>{client.name}</h1>
        <p>{client.email}</p>
      </section>

      {/* Sección de usuarios */}
      <ClientUsersSection
        clientId={client.id_client}
        clientName={client.name}
        initialUsers={users}
        onUserCreated={(newUser) => {
          setUsers(prev => [...prev, newUser]);
          console.log('Usuario creado:', newUser);
        }}
        onUserUpdated={(updatedUser) => {
          setUsers(prev => prev.map(u => 
            u.id_user === updatedUser.id_user ? updatedUser : u
          ));
          console.log('Usuario actualizado:', updatedUser);
        }}
        onUserDeleted={(userId) => {
          setUsers(prev => prev.filter(u => u.id_user !== userId));
          console.log('Usuario eliminado:', userId);
        }}
      />
    </div>
  );
}
```

## Uso Avanzado

### Ejemplo 4: Con Estado Global (Zustand)

```tsx
// store/clients-store.ts
import { create } from 'zustand';
import { IClient, IUser } from '@/modules/account/clients';

interface ClientsStore {
  clients: IClient[];
  users: IUser[];
  selectedClient: IClient | null;
  setClients: (clients: IClient[]) => void;
  setUsers: (users: IUser[]) => void;
  selectClient: (client: IClient) => void;
  addUser: (user: IUser) => void;
  updateUser: (user: IUser) => void;
  deleteUser: (userId: number) => void;
}

export const useClientsStore = create<ClientsStore>((set) => ({
  clients: [],
  users: [],
  selectedClient: null,
  setClients: (clients) => set({ clients }),
  setUsers: (users) => set({ users }),
  selectClient: (client) => set({ selectedClient: client }),
  addUser: (user) => set((state) => ({ 
    users: [...state.users, user] 
  })),
  updateUser: (user) => set((state) => ({
    users: state.users.map(u => u.id_user === user.id_user ? user : u)
  })),
  deleteUser: (userId) => set((state) => ({
    users: state.users.filter(u => u.id_user !== userId)
  })),
}));

// Componente
'use client';

import { ClientManager } from '@/modules/account/clients';
import { useClientsStore } from '@/store/clients-store';
import { useEffect } from 'react';

export function ClientsPageWithStore({ 
  initialClients, 
  initialUsers 
}: {
  initialClients: IClient[];
  initialUsers: IUser[];
}) {
  const { clients, users, setClients, setUsers, addUser } = useClientsStore();

  useEffect(() => {
    setClients(initialClients);
    setUsers(initialUsers);
  }, [initialClients, initialUsers, setClients, setUsers]);

  return (
    <ClientManager 
      initialData={clients}
      initialUsers={users}
      onUserCreated={(user) => {
        addUser(user);
        // Sincronizar con backend si es necesario
      }}
    />
  );
}
```

### Ejemplo 5: Con React Query

```tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientManager } from '@/modules/account/clients';
import { 
  getClientsAction, 
  getUsersAction,
  createUserAction 
} from '@/app/[locale]/(protected)/account/actions';

export function ClientsPageWithReactQuery() {
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: getClientsAction,
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: getUsersAction,
  });

  const createUserMutation = useMutation({
    mutationFn: createUserAction,
    onSuccess: () => {
      // Invalidar cache para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  if (loadingClients || loadingUsers) {
    return <div>Cargando...</div>;
  }

  return (
    <ClientManager 
      initialData={clients}
      initialUsers={users}
    />
  );
}
```

### Ejemplo 6: Con Filtros Personalizados

```tsx
'use client';

import { useState, useMemo } from 'react';
import { ClientUsersSection } from '@/modules/account/clients';

export function FilteredClientUsers({ 
  clientId, 
  clientName, 
  allUsers 
}: {
  clientId: number;
  clientName: string;
  allUsers: IUser[];
}) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar usuarios
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      // Filtro por cliente
      if (user.client_id !== clientId) return false;

      // Filtro por estado
      if (statusFilter !== 'all' && user.status !== statusFilter) return false;

      // Filtro por búsqueda
      if (searchQuery && !user.username.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [allUsers, clientId, statusFilter, searchQuery]);

  return (
    <div className='space-y-4'>
      {/* Filtros personalizados */}
      <div className='flex gap-4'>
        <input
          type='text'
          placeholder='Buscar usuario...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='input'
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className='select'
        >
          <option value='all'>Todos</option>
          <option value='active'>Activos</option>
          <option value='inactive'>Inactivos</option>
        </select>
      </div>

      {/* Sección de usuarios con datos filtrados */}
      <ClientUsersSection
        clientId={clientId}
        clientName={clientName}
        initialUsers={filteredUsers}
      />
    </div>
  );
}
```

## Personalización

### Ejemplo 7: Personalizar Columnas de la Tabla

```tsx
'use client';

import { ClientUsersSection } from '@/modules/account/clients';
import { ColumnDef } from '@tanstack/react-table';
import { IUser } from '@/modules/account/users/models/user.interface';

// Crear componente personalizado extendiendo ClientUsersSection
export function CustomClientUsersSection(props: any) {
  // Definir columnas personalizadas
  const customColumns: ColumnDef<IUser>[] = [
    {
      accessorKey: 'username',
      header: 'Usuario',
      cell: (info) => (
        <div className='flex items-center gap-2'>
          <div className='h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center'>
            {info.getValue<string>()[0].toUpperCase()}
          </div>
          <span className='font-medium'>{info.getValue<string>()}</span>
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Fecha de Creación',
      cell: (info) => new Date(info.getValue<string>()).toLocaleDateString(),
    },
    {
      accessorKey: 'last_login',
      header: 'Último Acceso',
      cell: (info) => {
        const value = info.getValue<string>();
        return value ? new Date(value).toLocaleDateString() : 'Nunca';
      },
    },
    // ... más columnas personalizadas
  ];

  return <ClientUsersSection {...props} />;
}
```

### Ejemplo 8: Tema Personalizado

```tsx
'use client';

import { ClientManager } from '@/modules/account/clients';

export function ThemedClientManager(props: any) {
  return (
    <div className='custom-theme'>
      <style jsx global>{`
        .custom-theme {
          --primary: #6366f1;
          --primary-foreground: #ffffff;
          --border: #e5e7eb;
          --card: #ffffff;
        }
        
        .custom-theme .rounded-lg {
          border-radius: 1rem;
        }
        
        .custom-theme .shadow-sm {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      
      <ClientManager {...props} />
    </div>
  );
}
```

## Integración con Páginas

### Ejemplo 9: Layout con Sidebar

```tsx
// app/[locale]/(protected)/account/layout.tsx
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex min-h-screen'>
      {/* Sidebar */}
      <aside className='w-64 border-r bg-card'>
        <nav className='p-4 space-y-2'>
          <Link href='/account/clients' className='nav-link'>
            Clientes
          </Link>
          <Link href='/account/users' className='nav-link'>
            Usuarios
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className='flex-1 p-8'>
        {children}
      </main>
    </div>
  );
}

// app/[locale]/(protected)/account/clients/page.tsx
import { ClientManager } from '@/modules/account/clients';

export default async function ClientsPage() {
  const clients = await getClients();
  const users = await getUsers();

  return (
    <ClientManager 
      initialData={clients.content}
      initialUsers={users.content}
    />
  );
}
```

### Ejemplo 10: Con Breadcrumbs

```tsx
'use client';

import { ClientManager } from '@/modules/account/clients';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export function ClientsPageWithBreadcrumbs({ clients, users }: any) {
  return (
    <div className='space-y-6'>
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Cuenta', href: '/account' },
          { label: 'Clientes', href: '/account/clients', current: true },
        ]}
      />

      <ClientManager 
        initialData={clients}
        initialUsers={users}
      />
    </div>
  );
}
```

## Manejo de Errores

### Ejemplo 11: Error Boundaries

```tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ClientsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error en módulo de clientes:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex flex-col items-center justify-center min-h-[400px] space-y-4'>
          <h2 className='text-2xl font-bold text-destructive'>
            Algo salió mal
          </h2>
          <p className='text-muted-foreground'>
            {this.state.error?.message || 'Error desconocido'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className='btn btn-primary'
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Uso
export function ClientsPageWithErrorBoundary(props: any) {
  return (
    <ClientsErrorBoundary>
      <ClientManager {...props} />
    </ClientsErrorBoundary>
  );
}
```

### Ejemplo 12: Loading States

```tsx
'use client';

import { Suspense } from 'react';
import { ClientManager } from '@/modules/account/clients';

function ClientsLoading() {
  return (
    <div className='space-y-6 animate-pulse'>
      <div className='h-32 bg-muted rounded-3xl' />
      <div className='grid grid-cols-3 gap-4'>
        {[1, 2, 3].map(i => (
          <div key={i} className='h-24 bg-muted rounded-2xl' />
        ))}
      </div>
      <div className='h-96 bg-muted rounded-lg' />
    </div>
  );
}

export function ClientsPageWithLoading(props: any) {
  return (
    <Suspense fallback={<ClientsLoading />}>
      <ClientManager {...props} />
    </Suspense>
  );
}
```

## 🎓 Mejores Prácticas

### ✅ DO: Usar Server Components cuando sea posible

```tsx
// ✅ Bueno: Cargar datos en el servidor
export default async function Page() {
  const data = await getClients();
  return <ClientManager initialData={data} />;
}
```

### ❌ DON'T: Cargar datos en Client Components sin necesidad

```tsx
// ❌ Malo: Cargar datos en el cliente
'use client';
export default function Page() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(setData);
  }, []);
  return <ClientManager initialData={data} />;
}
```

### ✅ DO: Usar callbacks para comunicación

```tsx
// ✅ Bueno: Callbacks para eventos
<ClientUsersSection
  onUserCreated={(user) => {
    // Lógica personalizada
    analytics.track('user_created', user);
  }}
/>
```

### ❌ DON'T: Modificar estado interno directamente

```tsx
// ❌ Malo: Acceder a estado interno
// No hay forma de hacer esto, el diseño lo previene
```
