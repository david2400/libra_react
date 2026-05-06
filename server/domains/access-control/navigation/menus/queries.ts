import 'server-only';
import { cache } from 'react';

import { 
  menusRepository, 
  menuPermissionsRepository,
  roleMenusRepository,
  userMenusRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';


// --- Menus Queries ---------------------------------------------------------

export const getMenus = cache((params?: ListParams) => 
  menusRepository.list(params)
);

export const getMenuById = cache((id: string | number) => 
  menusRepository.getById(id)
);

export const getMenuTree = cache((params?: ListParams) => 
  menusRepository.getTree(params)
);

export const getFlatMenuStructure = cache((params?: ListParams) => 
  menusRepository.getFlat(params)
);

export const getRootMenus = cache(() => 
  menusRepository.getRootMenus()
);

export const getMenuChildren = cache((parentId: string | number) => 
  menusRepository.getChildren(parentId)
);

export const getMenuPath = cache((menuId: string | number) => 
  menusRepository.getPath(menuId)
);

// --- IMenu-IPermission Relationships Queries ---------------------------------

export const getMenuPermissions = cache((params?: ListParams) => 
  menuPermissionsRepository.list(params)
);

export const getMenuPermissionById = cache((menuId: string | number, permissionId: string | number) => 
  menuPermissionsRepository.getById(menuId, permissionId)
);

export const getPermissionsByMenu = cache((menuId: string | number) => 
  menuPermissionsRepository.getPermissionsByMenu(menuId)
);

export const getMenusByPermission = cache((permissionId: string | number) => 
  menuPermissionsRepository.getMenusByPermission(permissionId)
);

// --- IRole-IMenu Relationships Queries -----------------------------------------

export const getRoleMenus = cache((params?: ListParams) => 
  roleMenusRepository.list(params)
);

export const getRoleMenuById = cache((roleId: string | number, menuId: string | number) => 
  roleMenusRepository.getById(roleId, menuId)
);

export const getMenusByRole = cache((roleId: string | number) => 
  roleMenusRepository.getMenusByRole(roleId)
);

export const getRolesByMenu = cache((menuId: string | number) => 
  roleMenusRepository.getRolesByMenu(menuId)
);

// --- IUser-IMenu Relationships Queries -----------------------------------------

export const getUserMenus = cache((params?: ListParams) => 
  userMenusRepository.list(params)
);

export const getUserMenuById = cache((userId: string | number, menuId: string | number) => 
  userMenusRepository.getById(userId, menuId)
);

export const getMenusByUser = cache((userId: string | number) => 
  userMenusRepository.getMenusByUser(userId)
);

export const getUsersByMenu = cache((menuId: string | number) => 
  userMenusRepository.getUsersByMenu(menuId)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get menu with all relationships
export const getMenuProfile = cache(async (menuId: string | number) => {
  const [menu, permissions, roles, users] = await Promise.all([
    getMenuById(menuId),
    getPermissionsByMenu(menuId),
    getRolesByMenu(menuId),
    getUsersByMenu(menuId)
  ]);
  
  return {
    menu,
    permissions,
    roles,
    users
  };
});

// Get menu tree with permissions
export const getMenuTreeWithPermissions = cache(async (params?: ListParams) => {
  const [menuTree, allMenuPermissions] = await Promise.all([
    getMenuTree(params),
    getMenuPermissions()
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
export const getUserMenuTree = cache(async (userId: string | number) => {
  const [userMenus, menuTree] = await Promise.all([
    getMenusByUser(userId),
    getMenuTree()
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
export const getRoleMenuTree = cache(async (roleId: string | number) => {
  const [roleMenus, menuTree] = await Promise.all([
    getMenusByRole(roleId),
    getMenuTree()
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
export const getMenuHierarchyStats = cache(async () => {
  const [menuTree, flatMenu] = await Promise.all([
    getMenuTree(),
    getFlatMenuStructure()
  ]);
  
  return {
    total_menus: flatMenu.menus.length,
    root_menus: flatMenu.menus.filter(m => !m.parentId).length,
    max_depth: menuTree.max_depth,
    total_nodes: menuTree.total_nodes
  };
});

// Get menu usage statistics
export const getMenuUsageStats = cache(async (menuId: string | number) => {
  const [menu, permissions, roles, users] = await Promise.all([
    getMenuById(menuId),
    getPermissionsByMenu(menuId),
    getRolesByMenu(menuId),
    getUsersByMenu(menuId)
  ]);
  
  return {
    menu,
    permission_count: permissions.length,
    role_count: roles.length,
    user_count: users.length,
    total_usage: permissions.length + roles.length + users.length
  };
});
