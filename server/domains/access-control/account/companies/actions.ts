'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  companiesRepository, 
  companyClientsRepository,
  companyActivityRepository,
  companyConfigRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { 
  ICreateCompanyPayload, 
  IUpdateCompanyPayload,
  ICreateCompanyClientPayload,
  IUpdateCompanyClientPayload,
  ICompanyActivity,
  ICreateCompanyConfigPayload,
  IUpdateCompanyConfigPayload
} from './types';

// --- Companies Actions ---------------------------------------------------------

export const createCompanyAction = async (payload: ICreateCompanyPayload): Promise<ActionResultType<any>> => {
  try {
    const company = await companiesRepository.create(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companies());
    if (typeof company.id === 'string' || typeof company.id === 'number') {
      await revalidateCacheTag(accessControlTags.company(company.id));
    }
    
    // Log activity
    await companyActivityRepository.create({
      companyId: company.id,
      activityType: 'profile_update',
      description: 'ICompany created',
      metadata: { companyName: company.name }
    });
    
    return { success: true, data: company };
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
        message: 'Failed to create company',
        details: error
      }
    };
  }
};

export const updateCompanyAction = async (id: string | number, payload: IUpdateCompanyPayload): Promise<ActionResultType<any>> => {
  try {
    const company = await companiesRepository.update(id, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companies());
    await revalidateCacheTag(accessControlTags.company(id));
    
    // Log activity
    await companyActivityRepository.create({
      companyId: id,
      activityType: 'profile_update',
      description: 'ICompany profile updated',
      metadata: { updated_fields: Object.keys(payload) }
    });
    
    return { success: true, data: company };
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
        message: 'Failed to update company',
        details: error
      }
    };
  }
};

export const deleteCompanyAction = async (id: string | number): Promise<ActionResultType<void>> => {
  try {
    await companiesRepository.delete(id);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companies());
    await revalidateCacheTag(accessControlTags.company(id));
    
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
        message: 'Failed to delete company',
        details: error
      }
    };
  }
};

// --- ICompany-Client Relationships Actions ---------------------------------

export const create_company_client_action = async (companyId: string | number, clientId: string | number, payload: ICreateCompanyClientPayload): Promise<ActionResultType<any>> => {
  try {
    const companyClient = await companyClientsRepository.create(companyId, clientId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companies());
    await revalidateCacheTag(accessControlTags.company(companyId));
    await revalidateCacheTag(accessControlTags.client(clientId));
    
    // Log activity
    await companyActivityRepository.create({
      companyId: companyId,
      activityType: 'client_added',
      description: `Client added to company (Client ID: ${clientId})`,
      metadata: { 
        clientId: clientId, 
        isPrimary: payload.isPrimary,
        relationshipType: payload.relationshipType 
      }
    });
    
    return { success: true, data: companyClient };
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
        message: 'Failed to create company-client relationship',
        details: error
      }
    };
  }
};

export const update_company_client_action = async (companyId: string | number, clientId: string | number, payload: IUpdateCompanyClientPayload): Promise<ActionResultType<any>> => {
  try {
    const companyClient = await companyClientsRepository.update(companyId, clientId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companies());
    await revalidateCacheTag(accessControlTags.company(companyId));
    
    // Log activity
    await companyActivityRepository.create({
      companyId: companyId,
      activityType: 'profile_update',
      description: `ICompany-client relationship updated (Client ID: ${clientId})`,
      metadata: { 
        clientId: clientId, 
        updated_fields: Object.keys(payload)
      }
    });
    
    return { success: true, data: companyClient };
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
        message: 'Failed to update company-client relationship',
        details: error
      }
    };
  }
};

export const delete_company_client_action = async (companyId: string | number, clientId: string | number): Promise<ActionResultType<void>> => {
  try {
    await companyClientsRepository.delete(companyId, clientId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companies());
    await revalidateCacheTag(accessControlTags.company(companyId));
    await revalidateCacheTag(accessControlTags.client(clientId));
    
    // Log activity
    await companyActivityRepository.create({
      companyId: companyId,
      activityType: 'client_removed',
      description: `Client removed from company (Client ID: ${clientId})`,
      metadata: { clientId: clientId }
    });
    
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
        message: 'Failed to delete company-client relationship',
        details: error
      }
    };
  }
};

// --- ICompany Configuration Actions -----------------------------------------

export const create_company_config_action = async (companyId: string | number, payload: ICreateCompanyConfigPayload): Promise<ActionResultType<any>> => {
  try {
    const config = await companyConfigRepository.create(companyId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companies());
    await revalidateCacheTag(accessControlTags.company(companyId));
    
    // Log activity
    await companyActivityRepository.create({
      companyId: companyId,
      activityType: 'profile_update',
      description: `ICompany configuration added (Key: ${payload.key})`,
      metadata: { 
        config_key: payload.key,
        is_encrypted: payload.is_encrypted
      }
    });
    
    return { success: true, data: config };
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
        message: 'Failed to create company config',
        details: error
      }
    };
  }
};

export const update_company_config_action = async (companyId: string | number, key: string, payload: IUpdateCompanyConfigPayload): Promise<ActionResultType<any>> => {
  try {
    const config = await companyConfigRepository.update(companyId, key, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companies());
    await revalidateCacheTag(accessControlTags.company(companyId));
    
    // Log activity
    await companyActivityRepository.create({
      companyId: companyId,
      activityType: 'profile_update',
      description: `ICompany configuration updated (Key: ${key})`,
      metadata: { 
        config_key: key,
        updated_fields: Object.keys(payload)
      }
    });
    
    return { success: true, data: config };
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
        message: 'Failed to update company config',
        details: error
      }
    };
  }
};

export const delete_company_config_action = async (companyId: string | number, key: string): Promise<ActionResultType<void>> => {
  try {
    await companyConfigRepository.delete(companyId, key);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companies());
    await revalidateCacheTag(accessControlTags.company(companyId));
    
    // Log activity
    await companyActivityRepository.create({
      companyId: companyId,
      activityType: 'profile_update',
      description: `ICompany configuration deleted (Key: ${key})`,
      metadata: { config_key: key }
    });
    
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
        message: 'Failed to delete company config',
        details: error
      }
    };
  }
};

// --- ICompany Activity Actions ---------------------------------------------

export const create_company_activity_action = async (activity: Omit<ICompanyActivity, 'id' | 'createdAt'>): Promise<ActionResultType<any>> => {
  try {
    const createdActivity = await companyActivityRepository.create(activity);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companies());
    await revalidateCacheTag(accessControlTags.company(activity.companyId));
    
    return { success: true, data: createdActivity };
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
        message: 'Failed to create company activity',
        details: error
      }
    };
  }
};
