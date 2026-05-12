// --- IUser-IPermission Relationships Queries -----------------------------------

import { cache } from "react";
import { userPermissionsRepository } from ".";
import { ListParams } from "@/server";

export const getUserPermissions = cache((params?: ListParams) =>
    userPermissionsRepository.list(params)
);

export const getUserPermissionById = cache((userId: string | number, permissionId: string | number) =>
    userPermissionsRepository.getById(userId, permissionId)
);

export const getPermissionsByUser = cache((userId: string | number) =>
    userPermissionsRepository.getPermissionsByUser(userId)
);

export const getUsersByPermission = cache((permissionId: string | number) =>
    userPermissionsRepository.getUsersByPermission(permissionId)
);