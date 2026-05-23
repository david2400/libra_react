import { IApplication } from "@/server/domains/access-control/security/applications";
import { IModule } from "@/server/domains/access-control/security/modules_applications";

export const mockApplications: IApplication[] = [
  { id_application: 1, name: 'Admin Portal', code: 'ADMIN' },
  { id_application: 2, name: 'Customer App', code: 'CUSTOMER' },
  { id_application: 3, name: 'API Gateway', code: 'API' },
];

export const mockModules: IModule[] = [
  { id: 1, name: 'Users', code: 'USERS', description: 'User management module' },
  { id: 2, name: 'Roles', code: 'ROLES', description: 'Role and permission management' },
  { id: 3, name: 'Products', code: 'PRODUCTS', description: 'Product catalog management' },
  { id: 4, name: 'Orders', code: 'ORDERS', description: 'Order processing and tracking' },
  { id: 5, name: 'Reports', code: 'REPORTS', description: 'Analytics and reporting' },
  { id: 6, name: 'Settings', code: 'SETTINGS', description: 'System configuration' },
  { id: 7, name: 'Notifications', code: 'NOTIFICATIONS', description: 'Notification management' },
  { id: 8, name: 'Audit', code: 'AUDIT', description: 'System audit and logging' },
];

export const PERMISSION_TYPES: PermissionType[] = ['API', 'APPLICATION', 'UI', 'SYSTEM'];

export const PERMISSION_ACTIONS: PermissionAction[] = [
  'CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE', 'VIEW', 'MANAGE', 'ADMIN', 'APPROVE', 'REJECT'
];

export const API_TYPES = ['REST', 'GraphQL', 'gRPC', 'SOAP', 'WebSockets', 'RPC (general)'] as const;

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'] as const;

// Generate permissions for each module with all 4 types and CRUD actions
export const mockPermissions: IPermission[] = (() => {
  const permissions: IPermission[] = [];
  let id = 1;

  const types: PermissionType[] = ['API', 'APPLICATION', 'UI', 'SYSTEM'];
  const crudActions: PermissionAction[] = ['CREATE', 'READ', 'UPDATE', 'DELETE'];

  mockModules.forEach((module) => {
    types.forEach((type) => {
      crudActions.forEach((action) => {
        permissions.push({
          id_permission: id++,
          name: `${module.code}_${type}_${action}`,
          description: `${action} permission for ${module.name} in ${type} context`,
          permission_type: type,
          resource: module.code.toLowerCase(),
          action: action,
          application_id: 1,
          module_id: module.id,
          module: module,
          is_active: Math.random() > 0.2, // 80% active
          is_sensitive: action === 'DELETE' || type === 'SYSTEM',
          api_type: type === 'API' ? 'REST' : undefined,
          http_method: type === 'API' ? (action === 'CREATE' ? 'POST' : action === 'READ' ? 'GET' : action === 'UPDATE' ? 'PUT' : 'DELETE') : undefined,
          endpoint_path: type === 'API' ? `/api/${module.code.toLowerCase()}` : undefined,
          ui_component: type === 'UI' ? `${module.name}${action.charAt(0)}${action.slice(1).toLowerCase()}View` : undefined,
          priority: type === 'SYSTEM' ? 100 : type === 'API' ? 50 : 25,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      });
    });
  });

  return permissions;
})();

export const mockRoles: IRole[] = [
  {
    id: 1,
    name: 'Super Admin',
    code: 'SUPER_ADMIN',
    description: 'Full system access with all permissions',
    is_active: true,
    permissions: mockPermissions.map(p => p.id_permission), // All permissions
  },
  {
    id: 2,
    name: 'Administrator',
    code: 'ADMIN',
    description: 'Administrative access to most features',
    is_active: true,
    permissions: mockPermissions
      .filter(p => p.permission_type !== 'SYSTEM')
      .map(p => p.id_permission),
  },
  {
    id: 3,
    name: 'Editor',
    code: 'EDITOR',
    description: 'Can edit and manage content',
    is_active: true,
    permissions: mockPermissions
      .filter(p => ['UI', 'APPLICATION'].includes(p.permission_type) && p.action !== 'DELETE')
      .map(p => p.id_permission),
  },
  {
    id: 4,
    name: 'Viewer',
    code: 'VIEWER',
    description: 'Read-only access to content',
    is_active: true,
    permissions: mockPermissions
      .filter(p => p.action === 'READ' || p.action === 'VIEW')
      .map(p => p.id_permission),
  },
  {
    id: 5,
    name: 'API Consumer',
    code: 'API_CONSUMER',
    description: 'API access only for external integrations',
    is_active: true,
    permissions: mockPermissions
      .filter(p => p.permission_type === 'API' && ['READ', 'VIEW'].includes(p.action))
      .map(p => p.id_permission),
  },
];

// Deep nested menu structure for testing 16+ levels
function createDeepMenu(depth: number, parentId?: number, baseId: number = 1000): IMenu[] {
  if (depth <= 0) return [];

  const menu: IMenu = {
    id_menu: baseId,
    application_id: 1,
    name: `Level ${16 - depth + 1}`,
    path: `/level-${16 - depth + 1}`,
    icon: 'Folder',
    sort_order: 1,
    parent_id: parentId,
    visible: true,
    children: createDeepMenu(depth - 1, baseId, baseId + 1),
  };

  return [menu];
}

// 5 Main Menu Options with up to 7 levels of nesting
export const mockMenus: IMenu[] = [
  // 1. Dashboard (simple, no children)
  {
    id_menu: 1,
    application_id: 1,
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    sort_order: 1,
    visible: true,
    children: [],
  },

  // 2. Catalog - 7 levels deep
  {
    id_menu: 100,
    application_id: 1,
    name: 'Catalog',
    path: '/catalog',
    icon: 'Package',
    sort_order: 2,
    visible: true,
    children: [
      {
        id_menu: 101,
        application_id: 1,
        name: 'Belleza',
        path: '/catalog/belleza',
        icon: 'Sparkles',
        sort_order: 1,
        parent_id: 100,
        visible: true,
        children: [
          {
            id_menu: 102,
            application_id: 1,
            name: 'Maquillaje',
            path: '/catalog/belleza/maquillaje',
            icon: 'Palette',
            sort_order: 1,
            parent_id: 101,
            visible: true,
            children: [
              {
                id_menu: 103,
                application_id: 1,
                name: 'Labiales',
                path: '/catalog/belleza/maquillaje/labiales',
                icon: 'Smile',
                sort_order: 1,
                parent_id: 102,
                visible: true,
                children: [
                  {
                    id_menu: 104,
                    application_id: 1,
                    name: 'Mate',
                    path: '/catalog/belleza/maquillaje/labiales/mate',
                    icon: 'Circle',
                    sort_order: 1,
                    parent_id: 103,
                    visible: true,
                    children: [
                      {
                        id_menu: 105,
                        application_id: 1,
                        name: 'Larga Duracion',
                        path: '/catalog/belleza/maquillaje/labiales/mate/larga-duracion',
                        icon: 'Clock',
                        sort_order: 1,
                        parent_id: 104,
                        visible: true,
                        children: [
                          {
                            id_menu: 106,
                            application_id: 1,
                            name: 'Premium',
                            path: '/catalog/belleza/maquillaje/labiales/mate/larga-duracion/premium',
                            icon: 'Crown',
                            sort_order: 1,
                            parent_id: 105,
                            visible: true,
                            children: [
                              {
                                id_menu: 108,
                                application_id: 1,
                                name: 'Premium',
                                path: '/catalog/belleza/maquillaje/labiales/mate/larga-duracion/premium',
                                icon: 'Crown',
                                sort_order: 1,
                                parent_id: 106,
                                visible: true,
                              }
                            ]
                          },
                          {
                            id_menu: 107,
                            application_id: 1,
                            name: 'Economico',
                            path: '/catalog/belleza/maquillaje/labiales/mate/larga-duracion/economico',
                            icon: 'Tag',
                            sort_order: 2,
                            parent_id: 105,
                            visible: true,
                          },
                        ],
                      },
                      {
                        id_menu: 108,
                        application_id: 1,
                        name: 'Transfer Proof',
                        path: '/catalog/belleza/maquillaje/labiales/mate/transfer-proof',
                        icon: 'CheckCircle',
                        sort_order: 2,
                        parent_id: 104,
                        visible: true,
                      },
                    ],
                  },
                  {
                    id_menu: 109,
                    application_id: 1,
                    name: 'Gloss',
                    path: '/catalog/belleza/maquillaje/labiales/gloss',
                    icon: 'Star',
                    sort_order: 2,
                    parent_id: 103,
                    visible: true,
                  },
                ],
              },
              {
                id_menu: 110,
                application_id: 1,
                name: 'Ojos',
                path: '/catalog/belleza/maquillaje/ojos',
                icon: 'Eye',
                sort_order: 2,
                parent_id: 102,
                visible: true,
                children: [
                  {
                    id_menu: 111,
                    application_id: 1,
                    name: 'Sombras',
                    path: '/catalog/belleza/maquillaje/ojos/sombras',
                    icon: 'Palette',
                    sort_order: 1,
                    parent_id: 110,
                    visible: true,
                  },
                  {
                    id_menu: 112,
                    application_id: 1,
                    name: 'Delineadores',
                    path: '/catalog/belleza/maquillaje/ojos/delineadores',
                    icon: 'Minus',
                    sort_order: 2,
                    parent_id: 110,
                    visible: true,
                  },
                ],
              },
              {
                id_menu: 113,
                application_id: 1,
                name: 'Rostro',
                path: '/catalog/belleza/maquillaje/rostro',
                icon: 'User',
                sort_order: 3,
                parent_id: 102,
                visible: true,
              },
            ],
          },
          {
            id_menu: 120,
            application_id: 1,
            name: 'Perfumeria',
            path: '/catalog/belleza/perfumeria',
            icon: 'Droplet',
            sort_order: 2,
            parent_id: 101,
            visible: true,
            children: [
              {
                id_menu: 121,
                application_id: 1,
                name: 'Nicho',
                path: '/catalog/belleza/perfumeria/nicho',
                icon: 'Diamond',
                sort_order: 1,
                parent_id: 120,
                visible: true,
              },
              {
                id_menu: 122,
                application_id: 1,
                name: 'Disenador',
                path: '/catalog/belleza/perfumeria/disenador',
                icon: 'Briefcase',
                sort_order: 2,
                parent_id: 120,
                visible: true,
              },
            ],
          },
          {
            id_menu: 130,
            application_id: 1,
            name: 'Cuidado de Piel',
            path: '/catalog/belleza/cuidado-piel',
            icon: 'Leaf',
            sort_order: 3,
            parent_id: 101,
            visible: true,
          },
        ],
      },
      {
        id_menu: 140,
        application_id: 1,
        name: 'Electronica',
        path: '/catalog/electronica',
        icon: 'Cpu',
        sort_order: 2,
        parent_id: 100,
        visible: true,
        children: [
          {
            id_menu: 141,
            application_id: 1,
            name: 'Smartphones',
            path: '/catalog/electronica/smartphones',
            icon: 'Phone',
            sort_order: 1,
            parent_id: 140,
            visible: true,
          },
          {
            id_menu: 142,
            application_id: 1,
            name: 'Computadoras',
            path: '/catalog/electronica/computadoras',
            icon: 'Monitor',
            sort_order: 2,
            parent_id: 140,
            visible: true,
          },
        ],
      },
      {
        id_menu: 150,
        application_id: 1,
        name: 'Hogar',
        path: '/catalog/hogar',
        icon: 'Home',
        sort_order: 3,
        parent_id: 100,
        visible: true,
      },
    ],
  },

  // 3. Users Management
  {
    id_menu: 200,
    application_id: 1,
    name: 'Users',
    path: '/users',
    icon: 'Users',
    sort_order: 3,
    visible: true,
    children: [
      {
        id_menu: 201,
        application_id: 1,
        name: 'All Users',
        path: '/users/list',
        icon: 'UserCircle',
        sort_order: 1,
        parent_id: 200,
        visible: true,
      },
      {
        id_menu: 202,
        application_id: 1,
        name: 'Roles',
        path: '/users/roles',
        icon: 'Shield',
        sort_order: 2,
        parent_id: 200,
        visible: true,
      },
      {
        id_menu: 203,
        application_id: 1,
        name: 'Permissions',
        path: '/users/permissions',
        icon: 'Key',
        sort_order: 3,
        parent_id: 200,
        visible: true,
      },
    ],
  },

  // 4. Reports
  {
    id_menu: 300,
    application_id: 1,
    name: 'Reports',
    path: '/reports',
    icon: 'BarChart3',
    sort_order: 4,
    visible: true,
    children: [
      {
        id_menu: 301,
        application_id: 1,
        name: 'Sales',
        path: '/reports/sales',
        icon: 'TrendingUp',
        sort_order: 1,
        parent_id: 300,
        visible: true,
      },
      {
        id_menu: 302,
        application_id: 1,
        name: 'Inventory',
        path: '/reports/inventory',
        icon: 'Database',
        sort_order: 2,
        parent_id: 300,
        visible: true,
      },
    ],
  },

  // 5. Settings
  {
    id_menu: 400,
    application_id: 1,
    name: 'Settings',
    path: '/settings',
    icon: 'Settings',
    sort_order: 5,
    visible: true,
    children: [
      {
        id_menu: 401,
        application_id: 1,
        name: 'General',
        path: '/settings/general',
        icon: 'Sliders',
        sort_order: 1,
        parent_id: 400,
        visible: true,
      },
      {
        id_menu: 402,
        application_id: 1,
        name: 'Integrations',
        path: '/settings/integrations',
        icon: 'Plug',
        sort_order: 2,
        parent_id: 400,
        visible: false,
      },
      {
        id_menu: 403,
        application_id: 1,
        name: 'Security',
        path: '/settings/security',
        icon: 'Lock',
        sort_order: 3,
        parent_id: 400,
        visible: true,
      },
    ],
  },
];

export const iconOptions = [
  'LayoutDashboard', 'Users', 'UserCircle', 'Shield', 'Key', 'Package', 'Grid',
  'FolderTree', 'ShoppingCart', 'BarChart3', 'Settings', 'Sliders', 'Plug',
  'Bell', 'Mail', 'FileText', 'Database', 'Server', 'Globe', 'Lock', 'Unlock',
  'Eye', 'EyeOff', 'Search', 'Filter', 'Plus', 'Minus', 'Edit', 'Trash',
  'Save', 'Download', 'Upload', 'RefreshCw', 'AlertCircle', 'CheckCircle',
  'XCircle', 'Info', 'HelpCircle', 'Calendar', 'Clock', 'Home', 'Building',
  'Map', 'Phone', 'MessageSquare', 'Send', 'Bookmark', 'Heart', 'Star', 'Tag',
  'Folder', 'FolderOpen', 'ChevronRight', 'ChevronDown', 'Sparkles', 'Palette',
  'Smile', 'Circle', 'Crown', 'Diamond', 'Droplet', 'Leaf', 'Briefcase', 'User',
  'TrendingUp', 'Cpu', 'Monitor',
];
