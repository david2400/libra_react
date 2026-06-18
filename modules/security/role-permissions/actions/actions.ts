'use server';

import { applicationsRepository } from '@/server/domains/access-control/security/applications/repository';
import { rolesRepository } from '@/server/domains/access-control/security/roles/repository';
import { rolePermissionsRepository } from '@/server/domains/access-control/security/role_permissions/repository';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import { IApplication } from '@/server/domains/access-control/security/applications';

// --- Applications Actions ----------------------------------------------------

export const listApplicationsAction = async (): Promise<IApplication[]> => {
  try {
    const response = await applicationsRepository.list();
    console.log(response)
    return response || [];
  } catch (error) {
    throw error;
  }
};

export const getActiveApplicationsAction = async (): Promise<ActionResultType<any[]>> => {
  try {
    const applications = await applicationsRepository.getActive();
    return { success: true, data: applications };
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
        message: 'Failed to load active applications',
        details: error
      }
    };
  }
};

// --- Roles Actions ---------------------------------------------------------

export const listRolesAction = async (): Promise<ActionResultType<any[]>> => {
  try {
    const response = await rolesRepository.list();
    const roles = response.content || [];
    return { success: true, data: roles };
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
        message: 'Failed to load roles',
        details: error
      }
    };
  }
};

export const listRolesByApplicationAction = async (applicationId: string | number): Promise<ActionResultType<any[]>> => {
  try {
    // For now, we'll get all roles and filter by application_id
    // In a real implementation, you might have a specific endpoint for this
    const response = await rolesRepository.list();
    const allRoles = response.content || [];

    // Filter roles by application_id
    const applicationRoles = allRoles.filter((role: any) =>
      role.application_id === applicationId
    );

    return { success: true, data: applicationRoles };
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
        message: 'Failed to load roles for application',
        details: error
      }
    };
  }
};

// --- Role Permissions Actions ----------------------------------------------

export const listRolePermissionsAction = async (): Promise<ActionResultType<any[]>> => {
  try {
    const response = await rolePermissionsRepository.list();
    const permissions = response.content || [];
    return { success: true, data: permissions };
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
        message: 'Failed to load role permissions',
        details: error
      }
    };
  }
};

export const listPermissionsByRoleAction = async (roleId: string | number): Promise<ActionResultType<any[]>> => {
  try {
    // For now, we'll get all permissions and filter by role_id
    // In a real implementation, you might have a specific endpoint for this
    const response = await rolePermissionsRepository.list();
    const allPermissions = response.content || [];

    // Filter permissions by role_id
    const rolePermissions = allPermissions.filter((permission: any) =>
      permission.role_id === roleId
    );

    return { success: true, data: rolePermissions };
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
        message: 'Failed to load permissions for role',
        details: error
      }
    };
  }
};

// --- Update Role Permission Action -------------------------------------------

export const updateRolePermissionAction = async (
  roleId: string | number,
  permissionId: string | number,
  payload: { level: string; is_active?: boolean }
): Promise<ActionResultType<any>> => {
  try {
    const updatePayload = {
      role_id: roleId,
      permission_id: permissionId,
      level: payload.level,
      is_active: payload.is_active
    };
    const updatedPermission = await rolePermissionsRepository.update(roleId, permissionId, updatePayload);
    return { success: true, data: updatedPermission };
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
        message: 'Failed to update role permission',
        details: error
      }
    };
  }
};

// --- Create Role Permission Action -------------------------------------------

export const createRolePermissionAction = async (
  roleId: string | number,
  permissionId: string | number,
  payload: { level: string; is_active?: boolean }
): Promise<ActionResultType<any>> => {
  try {
    const createPayload = {
      role_id: roleId,
      permission_id: permissionId,
      level: payload.level,
      is_active: payload.is_active
    };
    const newPermission = await rolePermissionsRepository.create(roleId, permissionId, createPayload);
    return { success: true, data: newPermission };
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
        message: 'Failed to create role permission',
        details: error
      }
    };
  }
};

// --- Bulk Update Role Permissions Action -------------------------------------

export const bulkUpdateRolePermissionsAction = async (
  roleId: string | number,
  permissions: Array<{
    permission_id: string | number;
    level: string;
    is_active?: boolean;
  }>
): Promise<ActionResultType<any>> => {
  try {
    const results = [];

    for (const permission of permissions) {
      try {
        const updatePayload = {
          role_id: roleId,
          permission_id: permission.permission_id,
          level: permission.level,
          is_active: permission.is_active
        };
        const result = await rolePermissionsRepository.update(roleId, permission.permission_id, updatePayload);
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({ success: false, error: String(error) });
      }
    }

    return { success: true, data: results };
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
        message: 'Failed to bulk update role permissions',
        details: error
      }
    };
  }
};
