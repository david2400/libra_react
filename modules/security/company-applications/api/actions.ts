// Client-safe API layer for company-applications actions
// Uses client-side API to avoid server-only import issues

import { clientApi } from '@/lib/client-api';
import type { 
  ICreateCompanyApplicationPayload, 
  IUpdateCompanyApplicationPayload,
  ICompanyApplication
} from '@/server/domains/access-control/security/company_applications/types';

export const createCompanyApplicationAction = async (payload: ICreateCompanyApplicationPayload): Promise<{ success: boolean; data?: ICompanyApplication; error?: { message: string; code?: string; details?: any } }> => {
  try {
    const companyApplication = await clientApi.post<ICompanyApplication>('/api/access_control/company_applications', payload);
    return { success: true, data: companyApplication };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to create company application',
        details: error
      }
    };
  }
};

export const updateCompanyApplicationAction = async (id: string | number, payload: IUpdateCompanyApplicationPayload): Promise<{ success: boolean; data?: ICompanyApplication; error?: { message: string; code?: string; details?: any } }> => {
  try {
    const companyApplication = await clientApi.put<ICompanyApplication>(`/api/access_control/company_applications/${id}`, payload);
    return { success: true, data: companyApplication };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to update company application',
        details: error
      }
    };
  }
};

export const deleteCompanyApplicationAction = async (id: string | number): Promise<{ success: boolean; data?: void; error?: { message: string; code?: string; details?: any } }> => {
  try {
    await clientApi.delete(`/api/access_control/company_applications/${id}`);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete company application',
        details: error
      }
    };
  }
};
