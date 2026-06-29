import 'server-only';
import { cache } from 'react';

import { 
  menusRepository, 
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import type { MenuTreeNode } from './types';
import { getMenuPermissions, getMenuPermissionsByMenu } from '../menu_permissions';
import { getMenusByRole, getRolesByMenu } from '../role_menus';
import { getMenusByUser, getUsersByMenu } from '../user_menus';
import { IPermission } from '../../security/permissions';


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


// --- Composite Queries (BFF patterns) -------------------------------------------

// Get menu with all relationships
export const getMenuProfile = cache(async (menuId: string | number) => {
  const numericMenuId = typeof menuId === 'string' ? parseInt(menuId, 10) : menuId;
  const [menu, permissions, roles, users] = await Promise.all([
    getMenuById(menuId),
    getMenuPermissionsByMenu(numericMenuId),
    getRolesByMenu(menuId),
    getUsersByMenu(menuId)
  ]);
  
  return {
    menu,
    permissions: permissions.content,
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
      const menuPermissions = allMenuPermissions.content.filter(
        (mp: any) => mp.menu_id === node.menu.id_menu
      );
      
      return {
        ...node,
        menu: {
          ...node.menu,
          permission_ids: menuPermissions.map((mp: any) => mp.permission_id)
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
      const hasAccess = userMenus.some((um: any) => um.menu_id === node.menu.id_menu);
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
      const hasAccess = roleMenus.some((rm: any) => rm.menu_id === node.menu.id_menu);
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
    root_menus: flatMenu.menus.filter((m: any) => !m.parent_id).length,
    max_depth: menuTree.max_depth,
    total_nodes: menuTree.total_nodes
  };
});

// Get menu usage statistics
export const getMenuUsageStats = cache(async (menuId: string | number) => {
  const numericMenuId = typeof menuId === 'string' ? parseInt(menuId, 10) : menuId;
  const [menu, permissions, roles, users] = await Promise.all([
    getMenuById(menuId),
    getMenuPermissionsByMenu(numericMenuId),
    getRolesByMenu(menuId),
    getUsersByMenu(menuId)
  ]);
  
  return {
    menu,
    permission_count: permissions.content.length,
    role_count: roles.length,
    user_count: users.length,
    total_usage: permissions.content.length + roles.length + users.length
  };
});
