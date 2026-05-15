import { IUser } from "../../account/users";
import { IPermission } from "../permissions";

export interface IUserPermission {
    user_id: number;
    permission_id: number;
    level: string;
    is_active: boolean;
    expires_at?: string;
    user?: IUser;
    permission?: IPermission;
    // Audit fields from AuditInfo
    created_at?: string;
    updated_at?: string;
}

export interface ICreateUserPermission {
    user_id: number;
    permission_id: number;
    level: string;
    is_active: boolean;
    expires_at?: string;
}

export interface IUpdateUserPermission {
    level?: string;
    is_active?: boolean;
    expires_at?: string;
}