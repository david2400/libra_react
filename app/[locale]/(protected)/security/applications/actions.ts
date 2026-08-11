"use server";

import {
  createApplicationAction,
  updateApplicationAction,
  deleteApplicationAction,
  getApplications,
} from '@/server/domains/access-control/security/applications';
import type {
  IApplication,
  ICreateApplication,
  IUpdateApplication,
} from '@/server/domains/access-control/security/applications';

export async function createApplicationServerAction(payload: ICreateApplication) {
  try {
    const result = await createApplicationAction(payload);

    if (!result.success) {
      throw new Error(result.error?.message ?? 'No se pudo crear la aplicación');
    }

    return result.data;

  } catch (error) {
    throw error;
  }
}

export async function updateApplicationServerAction(id: string | number, payload: IUpdateApplication) {
  try {
    const result = await updateApplicationAction(id, payload);

    if (!result.success) {
      throw new Error(result.error?.message ?? 'No se pudo actualizar la aplicación');
    }

    return result.data;

  } catch (error) {
    throw error;
  }
}

export async function deleteApplicationServerAction(id: string | number) {
  try {
    const result = await deleteApplicationAction(id);

    if (!result.success) {
      throw new Error(result.error?.message ?? 'No se pudo eliminar la aplicación');
    }

    return result.data;

  } catch (error) {
    throw error;
  }
}


export async function getAllApplicationsServerAction(): Promise<IApplication[]> {
  try {
    const result = await getApplications();

    return Array.isArray(result)
      ? result
      : result || [];
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return [];
  }

}