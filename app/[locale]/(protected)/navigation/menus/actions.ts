'use server';

import {
  createMenuAction,
  updateMenuAction,
  deleteMenuAction,
} from '@/server/domains/access-control/navigation/menus';
import type {
  ICreateMenu,
  IUpdateMenu,
} from '@/server/domains/access-control/navigation/menus';

export async function createMenuServerAction(payload: ICreateMenu) {
  try {
    const result = await createMenuAction(payload);

    if (!result.success) {
      throw new Error(result.error?.message ?? 'No se pudo crear el menú');
    }

    return result.data;

  } catch (error) {
    throw error;
  }
}

export async function updateMenuServerAction(id: string | number, payload: IUpdateMenu) {
  try {
    const result = await updateMenuAction(id, payload);

    if (!result.success) {
      throw new Error(result.error?.message ?? 'No se pudo actualizar el menú');
    }

    return result.data;

  } catch (error) {
    throw error;
  }
}

export async function deleteMenuServerAction(id: string | number) {
  try {
    const result = await deleteMenuAction(id);

    if (!result.success) {
      throw new Error(result.error?.message ?? 'No se pudo eliminar el menú');
    }

    return result.data;

  } catch (error) {
    throw error;
  }
}
