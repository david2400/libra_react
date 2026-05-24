'use server';

import {
  createModuleApplicationAction,
  updateModuleApplicationAction,
  deleteModuleApplicationAction,
  getModuleApplications,
} from '@/server/domains/access-control/security/modules_applications';
import type {
  ICreateModuleApplication,
  IModuleApplication,
  IUpdateModuleApplication,
} from '@/server/domains/access-control/security/modules_applications';

export async function createModuleApplicationServerAction(payload: ICreateModuleApplication) {
  const result = await createModuleApplicationAction(payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo crear el módulo de aplicación');
  }

  return result.data;
}

export async function updateModuleApplicationServerAction(moduleId: string | number, payload: IUpdateModuleApplication) {
  const result = await updateModuleApplicationAction(moduleId, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo actualizar el módulo de aplicación');
  }

  return result.data;
}

export async function deleteModuleApplicationServerAction(moduleId: string | number) {
  const result = await deleteModuleApplicationAction(moduleId);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo eliminar el módulo de aplicación');
  }

  return result.data;
}


export async function getAllModuleApplicationsServerAction(): Promise<IModuleApplication[]> {
  const result = await getModuleApplications();

  return Array.isArray(result)
    ? result
    : result?.content || [];
}