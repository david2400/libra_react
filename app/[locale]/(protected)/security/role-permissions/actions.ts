'use server';

import {
  createRolePermissionAction,
  updateRolePermissionAction,
  deleteRolePermissionAction,
} from '@/server/domains/access-control/security/role_permissions';
import type {
  ICreateRolePermission,
  IUpdateRolePermission,
} from '@/server/domains/access-control/security/role_permissions';

export async function createRolePermissionServerAction(roleId: string | number, permissionId: string | number, payload: ICreateRolePermission) {
  const result = await createRolePermissionAction(roleId, permissionId, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo crear el permiso de rol');
  }

  return result.data;
}

export async function updateRolePermissionServerAction(roleId: string | number, permissionId: string | number, payload: IUpdateRolePermission) {
  const result = await updateRolePermissionAction(roleId, permissionId, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo actualizar el permiso de rol');
  }

  return result.data;
}

export async function deleteRolePermissionServerAction(roleId: string | number, permissionId: string | number) {
  const result = await deleteRolePermissionAction(roleId, permissionId);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo eliminar el permiso de rol');
  }

  return result.data;
}
