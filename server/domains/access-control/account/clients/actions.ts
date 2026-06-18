'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import { clientsRepository, clientCompaniesRepository, clientActivityRepository } from './repository';
import type { ICreateClient, IUpdateClient, ICreateClientCompany, IUpdateClientCompany, IClient, IClientCompany } from './types';

// ─── Client Actions ─────────────────────────────────────────────────────────

export const getClientByIdServerAction = async (id: string | number): Promise<ActionResultType<IClient>> => {
  try {
    const client = await clientsRepository.getById(id);
    return { success: true, data: client };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    return {
      success: false,
      error: {
        message: 'Failed to get client',
        details: error
      }
    };
  }
};

export const listClientsServerAction = async (): Promise<IClient[]> => {
  try {
    console.log("hol")
    const clientsResponse = await clientsRepository.list();
    console.log("hol", clientsResponse)
    const clients = clientsResponse || [];
    return clients;
  } catch (error) {
    throw error;
  }
};

export const createClientAction = async (payload: ICreateClient): Promise<ActionResultType<IClient>> => {
  try {
    const client = await clientsRepository.create(payload);
    await revalidateCacheTag(accessControlTags.clients());
    return { success: true, data: client };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    return {
      success: false,
      error: {
        message: 'Failed to create client',
        details: error
      }
    };
  }
};

export const updateClientAction = async (id: string | number, payload: IUpdateClient): Promise<ActionResultType<IClient>> => {
  try {
    const client = await clientsRepository.update(id, payload);
    await revalidateCacheTag(accessControlTags.client(id));
    await revalidateCacheTag(accessControlTags.clients());
    return { success: true, data: client };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    return {
      success: false,
      error: {
        message: 'Failed to update client',
        details: error
      }
    };
  }
};

export const deleteClientAction = async (id: string | number): Promise<ActionResultType<void>> => {
  try {
    await clientsRepository.delete(id);
    await revalidateCacheTag(accessControlTags.client(id));
    await revalidateCacheTag(accessControlTags.clients());
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    return {
      success: false,
      error: {
        message: 'Failed to delete client',
        details: error
      }
    };
  }
};

// ─── Client ICompany Actions ─────────────────────────────────────────────────

export const createClientCompanyAction = async (
  clientId: string | number,
  companyId: string | number,
  payload: ICreateClientCompany
): Promise<ActionResultType<IClientCompany>> => {
  try {
    const clientCompany = await clientCompaniesRepository.create(clientId, companyId, payload);
    await revalidateCacheTag(accessControlTags.client(clientId));
    await revalidateCacheTag(accessControlTags.company(companyId));
    return { success: true, data: clientCompany };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    return {
      success: false,
      error: {
        message: 'Failed to create client-company relationship',
        details: error
      }
    };
  }
};

export const updateClientCompanyAction = async (
  clientId: string | number,
  companyId: string | number,
  payload: IUpdateClientCompany
): Promise<ActionResultType<IClientCompany>> => {
  try {
    const clientCompany = await clientCompaniesRepository.update(clientId, companyId, payload);
    await revalidateCacheTag(accessControlTags.client(clientId));
    await revalidateCacheTag(accessControlTags.company(companyId));
    return { success: true, data: clientCompany };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    return {
      success: false,
      error: {
        message: 'Failed to update client-company relationship',
        details: error
      }
    };
  }
};

export const deleteClientCompanyAction = async (
  clientId: string | number,
  companyId: string | number
): Promise<ActionResultType<void>> => {
  try {
    await clientCompaniesRepository.delete(clientId, companyId);
    await revalidateCacheTag(accessControlTags.client(clientId));
    await revalidateCacheTag(accessControlTags.company(companyId));
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    return {
      success: false,
      error: {
        message: 'Failed to delete client-company relationship',
        details: error
      }
    };
  }
};
