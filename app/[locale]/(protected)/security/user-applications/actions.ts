'use server';

import {
  ICreateUserApplication,
  IUpdateUserApplication,
} from "@/server/domains/access-control/security/user_applications";
import {
  getApplicationsByUser,
  createUserApplicationAction,
  deleteUserApplicationAction,
  assignApplicationToUserAction,
  revokeApplicationFromUserAction,
} from "@/server/domains/access-control/security/user_applications";

export async function getUserApplicationsByUserServerAction(
  userId: string | number,
) {
  try {
    const result = await getApplicationsByUser(userId);
    return Array.isArray(result) ? result : (result as any)?.content || [];
  } catch (error) {
    console.error("Error loading user applications:", error);
    throw error;
  }
}

export async function createUserApplicationServerAction(
  payload: ICreateUserApplication,
) {
  const result = await createUserApplicationAction(payload);
  if (!result.success) {
    throw new Error(result.error?.message ?? "No se pudo crear la asignación");
  }
  return result.data;
}

export async function deleteUserApplicationServerAction(
  id: string | number,
) {
  const result = await deleteUserApplicationAction(id);
  if (!result.success) {
    throw new Error(result.error?.message ?? "No se pudo eliminar la asignación");
  }
  return result.data;
}

export async function assignApplicationToUserServerAction(
  userId: string | number,
  applicationId: string | number,
) {
  const result = await assignApplicationToUserAction(userId, applicationId);
  if (!result.success) {
    throw new Error(result.error?.message ?? "No se pudo asignar la aplicación");
  }
  return result.data;
}

export async function revokeApplicationFromUserServerAction(
  userId: string | number,
  applicationId: string | number,
) {
  const result = await revokeApplicationFromUserAction(userId, applicationId);
  if (!result.success) {
    throw new Error(result.error?.message ?? "No se pudo revocar la aplicación");
  }
  return result.data;
}
