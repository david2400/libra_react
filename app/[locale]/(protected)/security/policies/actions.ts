'use server';

import {
  createPolicyAction,
  updatePolicyAction,
  deletePolicyAction,
} from '@/server/domains/access-control/security/policies';
import type {
  ICreatePolicy,
  IUpdatePolicy,
} from '@/server/domains/access-control/security/policies';

export async function createPolicyServerAction(payload: ICreatePolicy) {
  const result = await createPolicyAction(payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo crear la política');
  }

  return result.data;
}

export async function updatePolicyServerAction(id: string | number, payload: IUpdatePolicy) {
  const result = await updatePolicyAction(id, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo actualizar la política');
  }

  return result.data;
}

export async function deletePolicyServerAction(id: string | number) {
  const result = await deletePolicyAction(id);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo eliminar la política');
  }

  return result.data;
}
