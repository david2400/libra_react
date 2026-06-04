import 'server-only';
import type { ListParams, IPaginatedResponse, IAuditInfo } from '@/server/lib/types';
import { IApplication } from '../applications';

// --- IApplicationCategory Types -------------------------------------------------------------

export interface IApplicationCategory extends IAuditInfo {
  id_application_category: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parent_category_id?: number;
  level?: number;
  is_active: boolean;
  sort_order?: number;
  // parent_category?: IApplicationCategory;
  // child_categories?: IApplicationCategory[];
  // applications?: IApplication[];
}

export interface ICreateApplicationCategory {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parent_category_id?: number;
  level?: number;
  is_active: boolean;
  sort_order?: number;
}

export interface IUpdateApplicationCategory extends ICreateApplicationCategory {
  id_application_category?: number;
}

export interface IApplicationCategoryParams extends ListParams {
  parent_category_id?: number;
  is_active?: boolean;
  level?: number;
}

// --- Repository and Query Types -----------------------------------------------------------

export interface IApplicationCategoryRepository {
  findAll(params?: IApplicationCategoryParams): Promise<IPaginatedResponse<IApplicationCategory>>;
  findById(id: number): Promise<IApplicationCategory | null>;
  findByParentId(parentId: number): Promise<IApplicationCategory[]>;
  findActive(): Promise<IApplicationCategory[]>;
  findRootCategories(): Promise<IApplicationCategory[]>;
  create(data: ICreateApplicationCategory): Promise<IApplicationCategory>;
  update(id: number, data: IUpdateApplicationCategory): Promise<IApplicationCategory>;
  delete(id: number): Promise<void>;
}

export interface IApplicationCategoryQueries {
  findAll(params?: IApplicationCategoryParams): Promise<IPaginatedResponse<IApplicationCategory>>;
  findById(id: number): Promise<IApplicationCategory | null>;
  findByParentId(parentId: number): Promise<IApplicationCategory[]>;
  findActive(): Promise<IApplicationCategory[]>;
  findRootCategories(): Promise<IApplicationCategory[]>;
}

// --- Application-Category Relationship Types -----------------------------------------

export interface IApplicationCategoryAssignment {
  id_application_category_assignment: number;
  application_id: number;
  category_id: number;
  is_primary?: boolean;
  sort_order?: number;
  // application?: IApplication;
  // category?: IApplicationCategory;
}

export interface ICreateApplicationCategoryAssignment {
  application_id: number;
  category_id: number;
  is_primary?: boolean;
  sort_order?: number;
}

export interface IUpdateApplicationCategoryAssignment extends ICreateApplicationCategoryAssignment {
  id_application_category_assignment?: number;
}

// --- Category Statistics Types -----------------------------------------------------

export interface ICategoryStats {
  category_id: number;
  total_applications: number;
  active_applications: number;
  total_users: number;
  usage_count: number;
  last_updated: string;
}

export interface ICategoryOverview {
  category: IApplicationCategory;
  applications: IApplication[];
  child_categories: IApplicationCategory[];
  stats: ICategoryStats;
  application_count: number;
  subcategory_count: number;
}

// --- Bulk Operations Types ---------------------------------------------------------

export interface IBulkCategoryAssignmentPayload {
  category_id: number;
  application_ids: (string | number)[];
  is_primary?: boolean;
}

export interface IBulkCategoryAssignmentResponse {
  successful: IApplicationCategoryAssignment[];
  failed: Array<{
    application_id: string | number;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// --- Category Tree Types ----------------------------------------------------------

export interface ICategoryTreeNode extends IApplicationCategory {
  children: ICategoryTreeNode[];
  application_count: number;
  depth: number;
}

export interface ICategoryTree {
  root_categories: ICategoryTreeNode[];
  total_categories: number;
  total_applications: number;
  max_depth: number;
}
