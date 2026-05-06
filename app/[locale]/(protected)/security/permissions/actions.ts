'use server';

import {
  createPermissionAction,
  updatePermissionAction,
  deletePermissionAction,
} from '@/server/domains/access-control/security/permissions';
import type {
  ICreatePermissionPayload,
  IUpdatePermissionPayload,
} from '@/server/domains/access-control/security/permissions';

export async function createPermissionServerAction(payload: ICreatePermissionPayload) {
  const result = await createPermissionAction(payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo crear el permiso');
  }

  return result.data;
}

export async function updatePermissionServerAction(id: string | number, payload: IUpdatePermissionPayload) {
  const result = await updatePermissionAction(id, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo actualizar el permiso');
  }

  return result.data;
}

export async function deletePermissionServerAction(id: string | number) {
  const result = await deletePermissionAction(id);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo eliminar el permiso');
  }

  return result.data;
}
