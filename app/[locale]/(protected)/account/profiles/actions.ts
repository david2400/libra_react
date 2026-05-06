'use server';

import {
  createProfileAction,
  updateProfileAction,
  deleteProfileAction,
} from '@/server/domains/access-control/account/profiles';
import type {
  ICreateProfilePayload,
  IUpdateProfilePayload,
} from '@/server/domains/access-control/account/profiles';

export async function createProfileServerAction(payload: ICreateProfilePayload) {
  const result = await createProfileAction(payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo crear el perfil');
  }

  return result.data;
}

export async function updateProfileServerAction(id: string | number, payload: IUpdateProfilePayload) {
  const result = await updateProfileAction(id, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo actualizar el perfil');
  }

  return result.data;
}

export async function deleteProfileServerAction(id: string | number) {
  const result = await deleteProfileAction(id);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo eliminar el perfil');
  }

  return result.data;
}
