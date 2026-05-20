/**
 * Centralized cache tag definitions for on-demand revalidation.
 *
 * Convention:  `domain:entity`  or  `domain:entity:id`
 * Usage:       revalidateTag('access-control:users')
 */

// ─── Access Control ──────────────────────────────────────────────────────────
export const accessControlTags = {
  // Users
  users: () => 'access-control:users' as const,
  user: (id: number | string) => `access-control:user:${id}` as const,
  
  // Roles
  roles: () => 'access-control:roles' as const,
  role: (id: number | string) => `access-control:role:${id}` as const,
  
  // Permissions
  permissions: () => 'access-control:permissions' as const,
  permission: (id: number | string) => `access-control:permission:${id}` as const,
  
  // Policies
  policies: () => 'access-control:policies' as const,
  policy: (id: number | string) => `access-control:policy:${id}` as const,
  
  // Menus
  menus: () => 'access-control:menus' as const,
  menu: (id: number | string) => `access-control:menu:${id}` as const,
  menuRoots: () => 'access-control:menus:roots' as const,
  
  // IRole-IMenu relationships
  roleMenus: () => 'access-control:role-menus' as const,
  roleMenu: (roleId: number | string, menuId: number | string) => 
    `access-control:role-menu:${roleId}-${menuId}` as const,
  
  // IUser-IMenu relationships
  userMenus: () => 'access-control:user-menus' as const,
  userMenu: (userId: number | string, menuId: number | string) => 
    `access-control:user-menu:${userId}-${menuId}` as const,
  
  // IRole-IPermission relationships
  rolePermissions: () => 'access-control:role-permissions' as const,
  rolePermission: (roleId: number | string, permissionId: number | string) => 
    `access-control:role-permission:${roleId}-${permissionId}` as const,
  
  // IUser-IPermission relationships
  userPermissions: () => 'access-control:user-permissions' as const,
  userPermission: (userId: number | string, permissionId: number | string) => 
    `access-control:user-permission:${userId}-${permissionId}` as const,
  
  // IUser-Policy relationships
  userPolicies: () => 'access-control:user-policies' as const,
  userPolicy: (userId: number | string, policyId: number | string) => 
    `access-control:user-policy:${userId}-${policyId}` as const,
  
  // IMenu-IPermission relationships
  menuPermissions: () => 'access-control:menu-permissions' as const,
  menuPermission: (menuId: number | string, permissionId: number | string) => 
    `access-control:menu-permission:${menuId}-${permissionId}` as const,
  
  // Applications
  applications: () => 'access-control:applications' as const,
  application: (id: number | string) => `access-control:application:${id}` as const,
  
  // Clients
  clients: () => 'access-control:clients' as const,
  client: (id: number | string) => `access-control:client:${id}` as const,
  
  // Companies
  companies: () => 'access-control:companies' as const,
  company: (id: number | string) => `access-control:company:${id}` as const,
  
  // Profiles
  profiles: () => 'access-control:profiles' as const,
  profile: (id: number | string) => `access-control:profile:${id}` as const,
  
  // Modules-Applications
  modulesApplications: () => 'access-control:modules-applications' as const,
  modulesApplication: (id: number | string) => `access-control:modules-application:${id}` as const,
  
  // Company-Applications
  companyApplications: () => 'access-control:company-applications' as const,
  companyApplication: (id: number | string) => `access-control:company-application:${id}` as const,
  
  // Authorization
  authorization: () => 'access-control:authorization' as const,
  
  // Authentication
  auth: () => 'access-control:auth' as const,
  authSession: () => 'access-control:auth:session' as const,
} as const;

// Helper function for cache revalidation (Next.js 16 compatible)
export async function revalidateCacheTag(tag: string): Promise<void> {
  try {
    // Import revalidateTag dynamically to avoid build issues
    const { revalidateTag } = await import('next/cache');
    
    // In Next.js 16, revalidateTag expects (tag, options) where options is CacheLifeConfig
    // We'll try with proper options first, then fallback
    try {
      // Try Next.js 16+ API with proper options
      await revalidateTag(tag, { tags: [tag] });
    } catch {
      try {
        // Try with simple tag only
        await revalidateTag(tag);
      } catch {
        // If all fails, just log and continue
        console.warn(`Could not revalidate cache tag: ${tag}`);
      }
    }
  } catch (error) {
    // Log error but don't throw to avoid breaking the action
    console.warn(`Failed to revalidate cache tag: ${tag}`, error);
  }
}
