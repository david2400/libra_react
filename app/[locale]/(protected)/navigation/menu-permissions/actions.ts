'use server';

import {
  createMenuPermissionAction,
  updateMenuPermissionAction,
  deleteMenuPermissionAction,
} from '@/server/domains/access-control/navigation/menu_permissions';
import type {
  ICreateMenuPermission,
  IUpdateMenuPermission,
} from '@/server/domains/access-control/navigation/menu_permissions';

export async function createMenuPermissionServerAction(menuId: string | number, permissionId: string | number, payload: ICreateMenuPermission) {
  const result = await createMenuPermissionAction(menuId, permissionId, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo crear el permiso de menú');
  }

  return result.data;
}

export async function updateMenuPermissionServerAction(menuId: string | number, permissionId: string | number, payload: IUpdateMenuPermission) {
  const result = await updateMenuPermissionAction(menuId, permissionId, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo actualizar el permiso de menú');
  }

  return result.data;
}

export async function deleteMenuPermissionServerAction(menuId: string | number, permissionId: string | number) {
  const result = await deleteMenuPermissionAction(menuId, permissionId);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo eliminar el permiso de menú');
  }

  return result.data;
}
