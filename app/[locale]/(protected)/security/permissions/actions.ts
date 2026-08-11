'use server';

import {
  createPermissionAction,
  updatePermissionAction,
  deletePermissionAction,
} from '@/server/domains/access-control/security/permissions';
import type {
  ICreatePermission,
  IUpdatePermission,
} from '@/server/domains/access-control/security/permissions';

export async function createPermissionServerAction(payload: ICreatePermission) {
  try {
    const result = await createPermissionAction(payload);

    if (!result.success) {
      throw new Error(result.error?.message ?? 'No se pudo crear el permiso');
    }

    return result.data;

  } catch (error) {
    throw error;
  }
}

export async function updatePermissionServerAction(id: string | number, payload: IUpdatePermission) {
  try {
    const result = await updatePermissionAction(id, payload);

    if (!result.success) {
      throw new Error(result.error?.message ?? 'No se pudo actualizar el permiso');
    }

    return result.data;

  } catch (error) {
    throw error;
  }
}

export async function deletePermissionServerAction(id: string | number) {
  try {
    const result = await deletePermissionAction(id);

    if (!result.success) {
      throw new Error(result.error?.message ?? 'No se pudo eliminar el permiso');
    }

    return result.data;

  } catch (error) {
    throw error;
  }
}
