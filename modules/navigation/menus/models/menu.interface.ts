import type { menus } from '@/server/domains/access-control/navigation';

export type IMenuCreateRequest = menus.ICreateMenuPayload;
export type IMenuUpdateRequest = menus.IUpdateMenuPayload & { id: string | number };
export type IMenu = menus.IMenu;
