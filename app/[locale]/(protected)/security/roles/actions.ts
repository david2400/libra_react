'use server';

import {
  createRoleAction,
  updateRoleAction,
  deleteRoleAction,
} from '@/server/domains/access-control/security/roles';
import type {
  ICreateRole,
  IUpdateRole,
} from '@/server/domains/access-control/security/roles';

export async function createRoleServerAction(payload: ICreateRole) {
  const result = await createRoleAction(payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo crear el rol');
  }

  return result.data;
}

export async function updateRoleServerAction(id: string | number, payload: IUpdateRole) {
  const result = await updateRoleAction(id, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo actualizar el rol');
  }

  return result.data;
}

export async function deleteRoleServerAction(id: string | number) {
  const result = await deleteRoleAction(id);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo eliminar el rol');
  }

  return result.data;
}
