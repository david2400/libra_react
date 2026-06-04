'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  applicationCategoriesRepository, 
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { 
  ICreateApplicationCategory, 
  IUpdateApplicationCategory,
} from './types';

// --- Application Categories Actions -----------------------------------------------

export const createApplicationCategoryAction = async (payload: ICreateApplicationCategory): Promise<ActionResultType<any>> => {
  try {
    const category = await applicationCategoriesRepository.create(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applicationCategories());
    if (typeof category.id_application_category === 'string' || typeof category.id_application_category === 'number') {
      await revalidateCacheTag(accessControlTags.applicationCategory(category.id_application_category));
    }
    
    return { success: true, data: category };
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
        message: 'Failed to create application category',
        details: error
      }
    };
  }
};

export const updateApplicationCategoryAction = async (id: string | number, payload: IUpdateApplicationCategory): Promise<ActionResultType<any>> => {
  try {
    const category = await applicationCategoriesRepository.update(id, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applicationCategories());
    await revalidateCacheTag(accessControlTags.applicationCategory(id));
    
    return { success: true, data: category };
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
        message: 'Failed to update application category',
        details: error
      }
    };
  }
};

export const deleteApplicationCategoryAction = async (id: string | number): Promise<ActionResultType<void>> => {
  try {
    await applicationCategoriesRepository.delete(id);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applicationCategories());
    await revalidateCacheTag(accessControlTags.applicationCategory(id));
    
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
        message: 'Failed to delete application category',
        details: error
      }
    };
  }
};

// --- Assignment Actions ---------------------------------------------------------

export const assignApplicationToCategoryAction = async (categoryId: string | number, applicationId: string | number, isPrimary?: boolean): Promise<ActionResultType<any>> => {
  try {
    const assignment = await applicationCategoriesRepository.assignApplication(categoryId, applicationId, isPrimary);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applicationCategories());
    await revalidateCacheTag(accessControlTags.applicationCategory(categoryId));
    
    return { success: true, data: assignment };
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
        message: 'Failed to assign application to category',
        details: error
      }
    };
  }
};

export const unassignApplicationFromCategoryAction = async (categoryId: string | number, applicationId: string | number): Promise<ActionResultType<any>> => {
  try {
    const result = await applicationCategoriesRepository.unassignApplication(categoryId, applicationId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applicationCategories());
    await revalidateCacheTag(accessControlTags.applicationCategory(categoryId));
    
    return { success: true, data: result };
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
        message: 'Failed to unassign application from category',
        details: error
      }
    };
  }
};

export const bulkAssignApplicationsToCategoryAction = async (categoryId: string | number, applicationIds: (string | number)[], isPrimary?: boolean): Promise<ActionResultType<any>> => {
  try {
    const result = await applicationCategoriesRepository.bulkAssignApplications(categoryId, applicationIds, isPrimary);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applicationCategories());
    await revalidateCacheTag(accessControlTags.applicationCategory(categoryId));
    
    return { success: true, data: result };
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
        message: 'Failed to bulk assign applications to category',
        details: error
      }
    };
  }
};

// --- Status Management Actions ---------------------------------------------------

export const activateApplicationCategoryAction = async (id: string | number): Promise<ActionResultType<any>> => {
  try {
    const category = await applicationCategoriesRepository.activate(id);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applicationCategories());
    await revalidateCacheTag(accessControlTags.applicationCategory(id));
    
    return { success: true, data: category };
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
        message: 'Failed to activate application category',
        details: error
      }
    };
  }
};

export const deactivateApplicationCategoryAction = async (id: string | number): Promise<ActionResultType<any>> => {
  try {
    const category = await applicationCategoriesRepository.deactivate(id);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applicationCategories());
    await revalidateCacheTag(accessControlTags.applicationCategory(id));
    
    return { success: true, data: category };
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
        message: 'Failed to deactivate application category',
        details: error
      }
    };
  }
};

// --- Reordering Actions ---------------------------------------------------------

export const reorderApplicationCategoriesAction = async (categoryOrders: Array<{ id: number; sort_order: number }>): Promise<ActionResultType<any>> => {
  try {
    const result = await applicationCategoriesRepository.reorderCategories(categoryOrders);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applicationCategories());
    
    return { success: true, data: result };
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
        message: 'Failed to reorder application categories',
        details: error
      }
    };
  }
};

// --- Tree Operations -------------------------------------------------------------

export const rebuildCategoryTreeAction = async (): Promise<ActionResultType<any>> => {
  try {
    // This would typically call a specialized endpoint to rebuild the tree structure
    // For now, returning a placeholder structure
    await revalidateCacheTag(accessControlTags.applicationCategories());
    
    return { 
      success: true, 
      data: { 
        message: 'Category tree rebuild initiated',
        timestamp: new Date().toISOString()
      } 
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to rebuild category tree',
        details: error
      }
    };
  }
};

// --- Bulk Operations -------------------------------------------------------------

export const bulkUpdateCategoriesAction = async (updates: Array<{ id: number; data: IUpdateApplicationCategory }>): Promise<ActionResultType<any>> => {
  try {
    const results = await Promise.allSettled(
      updates.map(({ id, data }) => applicationCategoriesRepository.update(id, data))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applicationCategories());
    
    return {
      success: true,
      data: {
        total: updates.length,
        successful,
        failed,
        results
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to bulk update categories',
        details: error
      }
    };
  }
};

export const bulkDeleteCategoriesAction = async (categoryIds: (string | number)[]): Promise<ActionResultType<any>> => {
  try {
    const results = await Promise.allSettled(
      categoryIds.map(id => applicationCategoriesRepository.delete(id))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applicationCategories());
    
    return {
      success: true,
      data: {
        total: categoryIds.length,
        successful,
        failed,
        results
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to bulk delete categories',
        details: error
      }
    };
  }
};
