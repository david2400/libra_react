'use server';

import {
  createRoleMenuAction,
  updateRoleMenuAction,
  deleteRoleMenuAction,
} from '@/server/domains/access-control/navigation/role_menus';
import type {
  ICreateRoleMenu,
  IUpdateRoleMenu,
} from '@/server/domains/access-control/navigation/role_menus';

export async function createRoleMenuServerAction(roleId: string | number, menuId: string | number, payload: ICreateRoleMenu) {
  const result = await createRoleMenuAction(roleId, menuId, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo crear el menú de rol');
  }

  return result.data;
}

export async function updateRoleMenuServerAction(roleId: string | number, menuId: string | number, payload: IUpdateRoleMenu) {
  const result = await updateRoleMenuAction(roleId, menuId, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo actualizar el menú de rol');
  }

  return result.data;
}

export async function deleteRoleMenuServerAction(roleId: string | number, menuId: string | number) {
  const result = await deleteRoleMenuAction(roleId, menuId);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo eliminar el menú de rol');
  }

  return result.data;
}
