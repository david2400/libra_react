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

// Alias para compatibilidad con el módulo de clients
export { createUserServerAction as createUserAction };
export { updateUserServerAction as updateUserAction };
export { deleteUserServerAction as deleteUserAction };

// Nueva acción para obtener usuarios por cliente
export async function getUsersByClientAction(clientId: number) {
  try {
    const { usersRepository } = await import('@/server/domains/access-control/account/users');
    
    const result = await usersRepository.list({ 
      client_id: clientId 
    });

    if (!result) {
      return [];
    }

    // Si es una respuesta paginada, retornar el contenido
    if ('content' in result && Array.isArray(result.content)) {
      return result.content;
    }

    // Si es un array directo, retornarlo
    if (Array.isArray(result)) {
      return result;
    }

    return [];
  } catch (error) {
    console.error('Error loading users by client:', error);
    return [];
  }
}
