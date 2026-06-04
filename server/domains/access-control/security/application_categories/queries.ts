import 'server-only';
import { cache } from 'react';

import {
  applicationCategoriesRepository,
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import type { IApplicationCategory, ICategoryTreeNode, ICategoryTree, ICategoryOverview } from './types';

// --- Application Categories Queries -----------------------------------------------

export const getApplicationCategories = cache((params?: ListParams) => 
  applicationCategoriesRepository.list(params)
);

export const getApplicationCategoryById = cache((id: string | number) =>
  applicationCategoriesRepository.getById(id)
);

export const getActiveApplicationCategories = cache(() =>
  applicationCategoriesRepository.getActive()
);

export const getRootApplicationCategories = cache(() =>
  applicationCategoriesRepository.getRootCategories()
);

export const getApplicationCategoryTree = cache(() =>
  applicationCategoriesRepository.getCategoryTree()
);

// --- Category-specific Queries -------------------------------------------------

export const getCategoriesByParentId = cache((parentId: string | number) =>
  applicationCategoriesRepository.getByParentId(parentId)
);

export const getApplicationsByCategory = cache((categoryId: string | number) =>
  applicationCategoriesRepository.getApplications(categoryId)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get category with full details
export const getApplicationCategoryProfile = cache(async (id: string | number) => {
  const category = await getApplicationCategoryById(id);
  const applications = await getApplicationsByCategory(id);
  
  return {
    category,
    applications,
    isActive: category?.is_active ?? false,
    applicationCount: applications.length,
  };
});

// Get category overview with statistics
export const getApplicationCategoryOverview = cache(async (id: string | number) => {
  const category = await getApplicationCategoryById(id);
  const applications = await getApplicationsByCategory(id);
  const childCategories = await getCategoriesByParentId(id);
  
  return {
    category,
    applications,
    child_categories: childCategories,
    stats: {
      category_id: category?.id_application_category || 0,
      total_applications: applications.length,
      active_applications: applications.filter(app => app.is_active).length,
      total_users: 0, // Would be calculated from actual data
      usage_count: 0,
      last_updated: category?.updated_at || new Date().toISOString(),
    },
    application_count: applications.length,
    subcategory_count: childCategories.length,
  } as ICategoryOverview;
});

// Build category tree structure
export const buildCategoryTree = cache(async (): Promise<ICategoryTree> => {
  const allCategories = await getActiveApplicationCategories();
  const rootCategories = allCategories.filter(cat => !cat.parent_category_id);
  
  const buildTreeNode = (category: IApplicationCategory, depth: number = 0): ICategoryTreeNode => {
    const children = allCategories.filter(cat => cat.parent_category_id === category.id_application_category);
    const childTreeNodes = children.map(child => buildTreeNode(child, depth + 1));
    
    return {
      ...category,
      children: childTreeNodes,
      application_count: 0, // Would be calculated from actual data
      depth,
    };
  };
  
  const rootTreeNodes = rootCategories.map(root => buildTreeNode(root, 0));
  const maxDepth = Math.max(...rootTreeNodes.map(node => calculateMaxDepth(node)));
  
  return {
    root_categories: rootTreeNodes,
    total_categories: allCategories.length,
    total_applications: 0, // Would be calculated from actual data
    max_depth: maxDepth,
  };
});

// Helper function to calculate max depth
function calculateMaxDepth(node: ICategoryTreeNode): number {
  if (node.children.length === 0) {
    return node.depth;
  }
  return Math.max(...node.children.map(child => calculateMaxDepth(child)));
}

// Get category usage statistics
export const getCategoryUsageStats = cache(async (categoryId: string | number) => {
  const overview = await getApplicationCategoryOverview(categoryId);
  
  return {
    category_id: categoryId,
    total_applications: overview.application_count,
    active_applications: overview.stats.active_applications,
    total_users: overview.stats.total_users,
    usage_count: overview.stats.usage_count,
    last_updated: overview.stats.last_updated,
  };
});

// Get all categories with application counts
export const getCategoriesWithApplicationCounts = cache(async () => {
  const categories = await getActiveApplicationCategories();
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const applications = await getApplicationsByCategory(category.id_application_category);
      return {
        ...category,
        application_count: applications.length,
        active_application_count: applications.filter(app => app.is_active).length,
      };
    })
  );
  
  return categoriesWithCounts;
});

// Get category health status
export const getCategoryHealthStatus = cache(async (categoryId: string | number) => {
  const overview = await getApplicationCategoryOverview(categoryId);
  
  const healthStatus = {
    healthy: overview.application_count > 0 && overview.category?.is_active,
    issues: [] as string[],
    recommendations: [] as string[]
  };
  
  // Check for inactive status
  if (!overview.category?.is_active) {
    healthStatus.issues.push('Category is inactive');
    healthStatus.recommendations.push('Activate the category to make it available');
  }
  
  // Check for empty category
  if (overview.application_count === 0) {
    healthStatus.issues.push('No applications assigned to category');
    healthStatus.recommendations.push('Assign applications to this category');
  }
  
  // Check for inactive applications
  if (overview.stats.active_applications < overview.application_count) {
    healthStatus.issues.push(`${overview.application_count - overview.stats.active_applications} inactive applications`);
    healthStatus.recommendations.push('Review and activate inactive applications');
  }
  
  return {
    ...overview,
    health: healthStatus,
  };
});

// Get popular categories (by application count)
export const getPopularCategories = cache(async (limit: number = 10) => {
  const categoriesWithCounts = await getCategoriesWithApplicationCounts();
  
  return categoriesWithCounts
    .sort((a, b) => b.application_count - a.application_count)
    .slice(0, limit);
});

// Search categories
export const searchCategories = cache(async (query: string, limit: number = 20) => {
  const categories = await getActiveApplicationCategories();
  
  const filtered = categories.filter(category =>
    category.name.toLowerCase().includes(query.toLowerCase()) ||
    (category.description?.toLowerCase().includes(query.toLowerCase()) ?? false)
  );
  
  return filtered.slice(0, limit);
});
