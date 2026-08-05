'use server';


import { applicationCategoriesRepository } from '@/server/domains/access-control/security/application_categories';
import { IApplicationCategory } from '../../applications-category/models/applicationCategory.interface';

// --- Applications Actions ----------------------------------------------------

export const listApplicationsCategoriesAction = async (): Promise<IApplicationCategory[]> => {
  try {
    const response = await applicationCategoriesRepository.list();
    return response || [];
  } catch (error) {
    throw error;
  }
};
