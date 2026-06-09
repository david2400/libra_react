'use server';

import { getUsers } from '@/server/domains/access-control/account/users';
import { getCompanies } from '@/server/domains/access-control/account/companies';
import type { IUser } from '@/server/domains/access-control/account/users';
import type { ICompany } from '@/server/domains/access-control/account/companies';

export async function getUsersServerAction() {
  try {
    const result = await getUsers({ per_page: 100 });
    console.log('Users result:', result);
    
    if (!result) {
      console.error('Result is undefined or null');
      return [];
    }
    
    if (Array.isArray(result)) {
      return result;
    }
    
    if (result.content && Array.isArray(result.content)) {
      return result.content;
    }
    
    console.error('Unexpected result structure:', result);
    return [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function getCompaniesServerAction() {
  try {
    const result = await getCompanies({ per_page: 100 });
    console.log('Companies result:', result);
    
    if (!result) {
      console.error('Result is undefined or null');
      return [];
    }
    
    if (Array.isArray(result)) {
      return result;
    }
    
    if (result.content && Array.isArray(result.content)) {
      return result.content;
    }
    
    console.error('Unexpected result structure:', result);
    return [];
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
}
