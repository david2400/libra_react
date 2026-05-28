import type { MenuItem, Role, Permission } from './types';

export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: 'RiDashboardLine',
    path: '/dashboard',
  },
  {
    id: 'users',
    name: 'Usuarios',
    icon: 'RiUserLine',
    path: '/users',
    children: [
      {
        id: 'users-list',
        name: 'Lista de Usuarios',
        icon: 'RiListUnordered',
        path: '/users/list',
      },
      {
        id: 'users-roles',
        name: 'Roles y Permisos',
        icon: 'RiShieldUserLine',
        path: '/users/roles',
      },
      {
        id: 'users-groups',
        name: 'Grupos',
        icon: 'RiGroupLine',
        path: '/users/groups',
      },
    ],
  },
  {
    id: 'products',
    name: 'Productos',
    icon: 'RiShoppingBagLine',
    path: '/products',
    children: [
      {
        id: 'products-catalog',
        name: 'Catálogo',
        icon: 'RiBookOpenLine',
        path: '/products/catalog',
      },
      {
        id: 'products-inventory',
        name: 'Inventario',
        icon: 'RiArchiveLine',
        path: '/products/inventory',
      },
      {
        id: 'products-categories',
        name: 'Categorías',
        icon: 'RiFolderLine',
        path: '/products/categories',
      },
    ],
  },
  {
    id: 'orders',
    name: 'Pedidos',
    icon: 'RiFileListLine',
    path: '/orders',
    children: [
      {
        id: 'orders-pending',
        name: 'Pendientes',
        icon: 'RiTimeLine',
        path: '/orders/pending',
      },
      {
        id: 'orders-completed',
        name: 'Completados',
        icon: 'RiCheckLine',
        path: '/orders/completed',
      },
      {
        id: 'orders-returns',
        name: 'Devoluciones',
        icon: 'RiArrowGoBackLine',
        path: '/orders/returns',
      },
    ],
  },
  {
    id: 'reports',
    name: 'Reportes',
    icon: 'RiBarChartLine',
    path: '/reports',
    children: [
      {
        id: 'reports-sales',
        name: 'Ventas',
        icon: 'RiLineChartLine',
        path: '/reports/sales',
      },
      {
        id: 'reports-analytics',
        name: 'Analíticas',
        icon: 'RiPieChartLine',
        path: '/reports/analytics',
      },
    ],
  },
  {
    id: 'settings',
    name: 'Configuración',
    icon: 'RiSettingsLine',
    path: '/settings',
    children: [
      {
        id: 'settings-general',
        name: 'General',
        icon: 'RiToolsLine',
        path: '/settings/general',
      },
      {
        id: 'settings-notifications',
        name: 'Notificaciones',
        icon: 'RiNotificationLine',
        path: '/settings/notifications',
      },
      {
        id: 'settings-integrations',
        name: 'Integraciones',
        icon: 'RiPlugLine',
        path: '/settings/integrations',
      },
    ],
  },
];

export const roles: Role[] = [
  {
    id: 'admin',
    name: 'Administrador',
    color: '#10b981',
    description: 'Acceso completo al sistema',
  },
  {
    id: 'manager',
    name: 'Gerente',
    color: '#3b82f6',
    description: 'Gestión de equipos y reportes',
  },
  {
    id: 'editor',
    name: 'Editor',
    color: '#f59e0b',
    description: 'Puede editar contenido',
  },
  {
    id: 'viewer',
    name: 'Visualizador',
    color: '#8b5cf6',
    description: 'Solo lectura',
  },
];

// Initial permissions - Admin has all, others have partial
export const initialPermissions: Permission[] = [
  // Admin - full access
  ...menuItems.flatMap((menu) => {
    const permissions: Permission[] = [
      { menuId: menu.id, roleId: 'admin', canView: true, canCreate: true, canEdit: true, canDelete: true },
    ];
    if (menu.children) {
      menu.children.forEach((child) => {
        permissions.push({
          menuId: child.id,
          roleId: 'admin',
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
        });
      });
    }
    return permissions;
  }),
  // Manager - view and edit
  { menuId: 'dashboard', roleId: 'manager', canView: true, canCreate: false, canEdit: false, canDelete: false },
  { menuId: 'users', roleId: 'manager', canView: true, canCreate: true, canEdit: true, canDelete: false },
  { menuId: 'users-list', roleId: 'manager', canView: true, canCreate: true, canEdit: true, canDelete: false },
  { menuId: 'products', roleId: 'manager', canView: true, canCreate: true, canEdit: true, canDelete: false },
  { menuId: 'products-catalog', roleId: 'manager', canView: true, canCreate: true, canEdit: true, canDelete: false },
  { menuId: 'reports', roleId: 'manager', canView: true, canCreate: false, canEdit: false, canDelete: false },
  { menuId: 'reports-sales', roleId: 'manager', canView: true, canCreate: false, canEdit: false, canDelete: false },
  // Editor - limited
  { menuId: 'dashboard', roleId: 'editor', canView: true, canCreate: false, canEdit: false, canDelete: false },
  { menuId: 'products', roleId: 'editor', canView: true, canCreate: true, canEdit: true, canDelete: false },
  { menuId: 'products-catalog', roleId: 'editor', canView: true, canCreate: true, canEdit: true, canDelete: false },
  // Viewer - view only
  { menuId: 'dashboard', roleId: 'viewer', canView: true, canCreate: false, canEdit: false, canDelete: false },
  { menuId: 'reports', roleId: 'viewer', canView: true, canCreate: false, canEdit: false, canDelete: false },
  { menuId: 'reports-sales', roleId: 'viewer', canView: true, canCreate: false, canEdit: false, canDelete: false },
];
