import 'server-only';
import { cache } from 'react';

import { 
  menusRepository, 
  menuPermissionsRepository,
  roleMenusRepository,
  user_menus_repository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';


// --- Menus Queries ---------------------------------------------------------

export const get_menus = cache((params?: ListParams) => 
  menusRepository.list(params)
);

export const get_menu_by_id = cache((id: string | number) => 
  menusRepository.getById(id)
);

export const get_menu_tree = cache((params?: ListParams) => 
  menusRepository.get_tree(params)
);

export const get_flat_menu_structure = cache((params?: ListParams) => 
  menusRepository.get_flat(params)
);

export const get_root_menus = cache(() => 
  menusRepository.get_root_menus()
);

export const get_menu_children = cache((parentId: string | number) => 
  menusRepository.get_children(parentId)
);

export const get_menu_path = cache((menuId: string | number) => 
  menusRepository.get_path(menuId)
);

// --- IMenu-IPermission Relationships Queries ---------------------------------

export const get_menu_permissions = cache((params?: ListParams) => 
  menuPermissionsRepository.list(params)
);

export const get_menu_permission_by_id = cache((menuId: string | number, permissionId: string | number) => 
  menuPermissionsRepository.getById(menuId, permissionId)
);

export const get_permissions_by_menu = cache((menuId: string | number) => 
  menuPermissionsRepository.get_permissions_by_menu(menuId)
);

export const get_menus_by_permission = cache((permissionId: string | number) => 
  menuPermissionsRepository.get_menus_by_permission(permissionId)
);

// --- IRole-IMenu Relationships Queries -----------------------------------------

export const get_role_menus = cache((params?: ListParams) => 
  roleMenusRepository.list(params)
);

export const get_role_menu_by_id = cache((roleId: string | number, menuId: string | number) => 
  roleMenusRepository.getById(roleId, menuId)
);

export const get_menus_by_role = cache((roleId: string | number) => 
  roleMenusRepository.get_menus_by_role(roleId)
);

export const get_roles_by_menu = cache((menuId: string | number) => 
  roleMenusRepository.get_roles_by_menu(menuId)
);

// --- IUser-IMenu Relationships Queries -----------------------------------------

export const get_user_menus = cache((params?: ListParams) => 
  user_menus_repository.list(params)
);

export const get_user_menu_by_id = cache((userId: string | number, menuId: string | number) => 
  user_menus_repository.getById(userId, menuId)
);

export const get_menus_by_user = cache((userId: string | number) => 
  user_menus_repository.get_menus_by_user(userId)
);

export const get_users_by_menu = cache((menuId: string | number) => 
  user_menus_repository.get_users_by_menu(menuId)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get menu with all relationships
export const get_menu_profile = cache(async (menuId: string | number) => {
  const [menu, permissions, roles, users] = await Promise.all([
    get_menu_by_id(menuId),
    get_permissions_by_menu(menuId),
    get_roles_by_menu(menuId),
    get_users_by_menu(menuId)
  ]);
  
  return {
    menu,
    permissions,
    roles,
    users
  };
});

// Get menu tree with permissions
export const get_menu_tree_with_permissions = cache(async (params?: ListParams) => {
  const [menuTree, allMenuPermissions] = await Promise.all([
    get_menu_tree(params),
    get_menu_permissions()
  ]);
  
  // Attach permissions to each menu in the tree
  const attachPermissionsToTree = (nodes: MenuTreeNode[]): MenuTreeNode[] => {
    return nodes.map(node => {
      const menuPermissions = allMenuPermissions.data.filter(
        mp => mp.menuId === node.menu.id
      );
      
      return {
        ...node,
        menu: {
          ...node.menu,
          permissions: menuPermissions.map(mp => mp.permission).filter((p): p is IPermission => p !== undefined)
        },
        children: attachPermissionsToTree(node.children)
      };
    });
  };
  
  return {
    ...menuTree,
    tree: attachPermissionsToTree(menuTree.tree)
  };
});

// Get user accessible menu tree
export const get_user_menu_tree = cache(async (userId: string | number) => {
  const [userMenus, menuTree] = await Promise.all([
    get_menus_by_user(userId),
    get_menu_tree()
  ]);
  
  // Filter tree based on user's accessible menus
  const filterTreeForUser = (nodes: MenuTreeNode[]): MenuTreeNode[] => {
    return nodes.filter(node => {
      const hasAccess = userMenus.some(um => um.menuId === node.menu.id);
      if (!hasAccess) return false;
      
      node.children = filterTreeForUser(node.children);
      return true;
    });
  };
  
  return {
    ...menuTree,
    tree: filterTreeForUser(menuTree.tree)
  };
});

// Get role accessible menu tree
export const get_role_menu_tree = cache(async (roleId: string | number) => {
  const [roleMenus, menuTree] = await Promise.all([
    get_menus_by_role(roleId),
    get_menu_tree()
  ]);
  
  // Filter tree based on role's accessible menus
  const filterTreeForRole = (nodes: MenuTreeNode[]): MenuTreeNode[] => {
    return nodes.filter(node => {
      const hasAccess = roleMenus.some(rm => rm.menuId === node.menu.id);
      if (!hasAccess) return false;
      
      node.children = filterTreeForRole(node.children);
      return true;
    });
  };
  
  return {
    ...menuTree,
    tree: filterTreeForRole(menuTree.tree)
  };
});

// Get menu hierarchy statistics
export const get_menu_hierarchy_stats = cache(async () => {
  const [menuTree, flatMenu] = await Promise.all([
    get_menu_tree(),
    get_flat_menu_structure()
  ]);
  
  return {
    total_menus: flatMenu.menus.length,
    root_menus: flatMenu.menus.filter(m => !m.parentId).length,
    max_depth: menuTree.max_depth,
    total_nodes: menuTree.total_nodes
  };
});

// Get menu usage statistics
export const get_menu_usage_stats = cache(async (menuId: string | number) => {
  const [menu, permissions, roles, users] = await Promise.all([
    get_menu_by_id(menuId),
    get_permissions_by_menu(menuId),
    get_roles_by_menu(menuId),
    get_users_by_menu(menuId)
  ]);
  
  return {
    menu,
    permission_count: permissions.length,
    role_count: roles.length,
    user_count: users.length,
    total_usage: permissions.length + roles.length + users.length
  };
});
