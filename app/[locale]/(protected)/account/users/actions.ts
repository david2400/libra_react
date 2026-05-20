'use server';

import {
  createUserAction,
  updateUserAction,
  deleteUserAction,
} from '@/server/domains/access-control/account/users';
import type {
  ICreateUser,
  IUpdateUser,
} from '@/server/domains/access-control/account/users';

export async function createUserServerAction(payload: ICreateUser) {
  const result = await createUserAction(payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo crear el usuario');
  }

  return result.data;
}

export async function updateUserServerAction(id: number, payload: IUpdateUser) {
  const result = await updateUserAction(id, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo actualizar el usuario');
  }

  return result.data;
}

export async function deleteUserServerAction(id: number) {
  const result = await deleteUserAction(id);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo eliminar el usuario');
  }

  return result.data;
}
