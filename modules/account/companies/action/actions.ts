"use server"
import { clientApi } from '@/lib/client-api';
import type { 
  ICreateCompany, 
  IUpdateCompany,
  ICompany
} from '@/server/domains/access-control/account/companies/types';

export const createCompanyAction = async (payload: ICreateCompany): Promise<{ success: boolean; data?: ICompany; error?: { message: string; code?: string; details?: any } }> => {
  try {
    const company = await clientApi.post<ICompany>('/api/access_control/companies', payload);
    return { success: true, data: company };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to create company',
        details: error
      }
    };
  }
};

export const updateCompanyAction = async (id: string | number, payload: IUpdateCompany): Promise<{ success: boolean; data?: ICompany; error?: { message: string; code?: string; details?: any } }> => {
  try {
    const company = await clientApi.put<ICompany>(`/api/access_control/companies/${id}`, payload);
    return { success: true, data: company };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to update company',
        details: error
      }
    };
  }
};

export const deleteCompanyAction = async (id: string | number): Promise<{ success: boolean; data?: void; error?: { message: string; code?: string; details?: any } }> => {
  try {
    await clientApi.delete(`/api/access_control/companies/${id}`);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete company',
        details: error
      }
    };
  }
};


export async function getCompanies(): Promise<ICompany[]> {
  try {
    const response = await getCompanies();
    return Array.isArray(response) ? response : response?.data || [];
  } catch (error) {
    console.error('Error cargando niveles educativos:', error);
    return [];
  }
}



