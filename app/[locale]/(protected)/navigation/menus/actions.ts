'use server';

import {
  createMenuAction,
  updateMenuAction,
  deleteMenuAction,
} from '@/server/domains/access-control/navigation/menus';
import type {
  ICreateMenuPayload,
  IUpdateMenuPayload,
} from '@/server/domains/access-control/navigation/menus';

export async function createMenuServerAction(payload: ICreateMenuPayload) {
  const result = await createMenuAction(payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo crear el menú');
  }

  return result.data;
}

export async function updateMenuServerAction(id: string | number, payload: IUpdateMenuPayload) {
  const result = await updateMenuAction(id, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo actualizar el menú');
  }

  return result.data;
}

export async function deleteMenuServerAction(id: string | number) {
  const result = await deleteMenuAction(id);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo eliminar el menú');
  }

  return result.data;
}
