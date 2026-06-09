"use server";

import { getActiveApplicationCategories } from '@/server/domains/access-control/security/application_categories';
import type { IApplicationCategory } from '@/server/domains/access-control/security/application_categories';

export async function getApplicationCategoriesServerAction(): Promise<IApplicationCategory[]> {
  try {
    const result = await getActiveApplicationCategories();
    console.log('Categories result:', result);
    
    if (!result) {
      console.error('Categories result is undefined or null');
      return [];
    }
    
    if (Array.isArray(result)) {
      return result;
    }
    
    console.error('Unexpected categories result structure:', result);
    return [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
