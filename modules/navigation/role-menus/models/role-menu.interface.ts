import type { roleMenus } from '@/server/domains/access-control/navigation';

export type IRoleMenuCreateRequest = roleMenus.ICreateRoleMenuPayload;
export type IRoleMenuUpdateRequest = roleMenus.IUpdateRoleMenuPayload & { roleId: string | number; menuId: string | number };
export type IRoleMenu = roleMenus.IRoleMenu;
export type IRole = roleMenus.IRole;
export type IMenu = roleMenus.IMenu;
