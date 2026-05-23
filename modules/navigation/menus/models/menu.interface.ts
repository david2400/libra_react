import type { menus } from '@/server/domains/access-control/navigation';

export type IMenuCreateRequest = menus.ICreateMenu;
export type IMenuUpdateRequest = menus.IUpdateMenu;
export type IMenu = menus.IMenu;
export type IMenuWithDepth = menus.IMenu & { depth?: number };
