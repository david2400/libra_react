'use server';

import {
  createClientAction,
  updateClientAction,
  deleteClientAction,
} from '@/server/domains/access-control/account/clients';
import type {
  ICreateClientPayload,
  IUpdateClientPayload,
} from '@/server/domains/access-control/account/clients';

export async function createClientServerAction(payload: ICreateClientPayload) {
  const result = await createClientAction(payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo crear el cliente');
  }

  return result.data;
}

export async function updateClientServerAction(id: string | number, payload: IUpdateClientPayload) {
  const result = await updateClientAction(id, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo actualizar el cliente');
  }

  return result.data;
}

export async function deleteClientServerAction(id: string | number) {
  const result = await deleteClientAction(id);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo eliminar el cliente');
  }

  return result.data;
}
