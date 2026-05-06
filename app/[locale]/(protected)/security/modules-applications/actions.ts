'use server';

import {
  createModuleApplicationAction,
  updateModuleApplicationAction,
  deleteModuleApplicationAction,
} from '@/server/domains/access-control/security/modules_applications';
import type {
  ICreateModuleApplicationPayload,
  IUpdateModuleApplicationPayload,
} from '@/server/domains/access-control/security/modules_applications';

export async function createModuleApplicationServerAction(payload: ICreateModuleApplicationPayload) {
  const result = await createModuleApplicationAction(payload.moduleId, payload.applicationId, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo crear el módulo de aplicación');
  }

  return result.data;
}

export async function updateModuleApplicationServerAction(moduleId: string | number, applicationId: string | number, payload: IUpdateModuleApplicationPayload) {
  const result = await updateModuleApplicationAction(moduleId, applicationId, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo actualizar el módulo de aplicación');
  }

  return result.data;
}

export async function deleteModuleApplicationServerAction(moduleId: string | number, applicationId: string | number) {
  const result = await deleteModuleApplicationAction(moduleId, applicationId);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo eliminar el módulo de aplicación');
  }

  return result.data;
}
