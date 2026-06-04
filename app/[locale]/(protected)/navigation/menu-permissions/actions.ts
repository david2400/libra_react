'use server';

import {
  createMenuPermissionAction,
  updateMenuPermissionAction,
  deleteMenuPermissionAction,
  getMenuPermissions,
} from '@/server/domains/access-control/navigation/menu_permissions';
import type {
  ICreateMenuPermission,
  IUpdateMenuPermission,
} from '@/server/domains/access-control/navigation/menu_permissions';
import { getApplications } from '@/server/domains/access-control/security/applications';
import { getRoles } from '@/server/domains/access-control/security/roles';
import { getMenus } from '@/server/domains/access-control/navigation/menus';
import { getUsers } from '@/server/domains/access-control/account/users';
import { getUserPermissionProfile } from '@/server/domains/access-control/security/permission_resolution';
import type { IApplication } from '@/server/domains/access-control/security/applications';
import type { IRole } from '@/server/domains/access-control/security/roles';
import type { IMenu } from '@/server/domains/access-control/navigation/menus';
import type { IUser } from '@/server/domains/access-control/account/users';
import type { ListParams } from '@/server/lib/types';

export async function createMenuPermissionServerAction(menuId: string | number, permissionId: string | number, payload: ICreateMenuPermission) {
  const result = await createMenuPermissionAction(menuId, permissionId, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo crear el permiso de menú');
  }

  return result.data;
}

export async function updateMenuPermissionServerAction(menuId: string | number, permissionId: string | number, payload: IUpdateMenuPermission) {
  const result = await updateMenuPermissionAction(menuId, permissionId, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo actualizar el permiso de menú');
  }

  return result.data;
}

export async function deleteMenuPermissionServerAction(menuId: string | number, permissionId: string | number) {
  const result = await deleteMenuPermissionAction(menuId, permissionId);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo eliminar el permiso de menú');
  }

  return result.data;
}

export async function getApplicationsServerAction() {
  try {
    const result = await getApplications({ per_page: 100 });
    console.log('Applications result:', result);
    
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
    console.error('Error fetching applications:', error);
    return [];
  }
}

export async function getRolesByApplicationServerAction(applicationId: string | number) {
  try {
    const params: ListParams = {
      filters: {
        application_id: applicationId,
      },
    };
    const result = await getRoles(params);
    console.log('Roles result:', result);
    
    if (!result) {
      console.error('Roles result is undefined or null');
      return [];
    }
    
    if (Array.isArray(result)) {
      return result;
    }
    
    if (result.content && Array.isArray(result.content)) {
      return result.content;
    }
    
    console.error('Unexpected roles result structure:', result);
    return [];
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
}

export async function getMenusByApplicationServerAction(applicationId: string | number) {
  try {
    const params: ListParams = {
      filters: {
        application_id: applicationId,
      },
    };
    const result = await getMenus(params);
    console.log('Menus result:', result);
    
    if (!result) {
      console.error('Menus result is undefined or null');
      return [];
    }
    
    if (Array.isArray(result)) {
      return result;
    }
    
    if (result.content && Array.isArray(result.content)) {
      return result.content;
    }
    
    console.error('Unexpected menus result structure:', result);
    return [];
  } catch (error) {
    console.error('Error fetching menus:', error);
    return [];
  }
}

export async function getMenuPermissionsServerAction(applicationId?: string | number) {
  try {
    const params: ListParams | undefined = applicationId
      ? {
          filters: {
            application_id: applicationId,
          },
        }
      : undefined;
    const result = await getMenuPermissions(params);
    console.log('Menu permissions result:', result);
    
    if (!result) {
      console.error('Menu permissions result is undefined or null');
      return [];
    }
    
    if (Array.isArray(result)) {
      return result;
    }
    
    if (result.content && Array.isArray(result.content)) {
      return result.content;
    }
    
    console.error('Unexpected menu permissions result structure:', result);
    return [];
  } catch (error) {
    console.error('Error fetching menu permissions:', error);
    return [];
  }
}

export async function getUsersByApplicationServerAction(applicationId: string | number) {
  try {
    const params: ListParams = {
      filters: {
        application_id: applicationId,
      },
    };
    const result = await getUsers(params);
    console.log('Users result:', result);
    
    if (!result) {
      console.error('Users result is undefined or null');
      return [];
    }
    
    if (Array.isArray(result)) {
      return result;
    }
    
    if (result.content && Array.isArray(result.content)) {
      return result.content;
    }
    
    console.error('Unexpected users result structure:', result);
    return [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function getUserPermissionProfileServerAction(userId: string | number) {
  try {
    const result = await getUserPermissionProfile(Number(userId));
    console.log('User permission profile result:', result);
    
    if (!result) {
      console.error('User permission profile result is undefined or null');
      return null;
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching user permission profile:', error);
    return null;
  }
}
