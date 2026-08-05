import type { applicationCategories } from '@/server/domains/access-control/security';

export type IApplicationCategoryCreateRequest = applicationCategories.ICreateApplicationCategory;
export type IApplicationCategoryUpdateRequest = applicationCategories.IUpdateApplicationCategory;
export type IApplicationCategory = applicationCategories.IApplicationCategory;
export type IApplicationCategoryWithDepth = applicationCategories.IApplicationCategory & { depth?: number };
