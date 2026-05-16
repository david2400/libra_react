import { IAuditInfo } from "@/server/lib/types";
import { IUser } from "../../account/users";
import { IPermission } from "../permissions";

export interface IUserPermission extends IAuditInfo {
    user_id: number;
    permission_id: number;
    level: string;
    expires_at?: string;
    user?: IUser;
    permission?: IPermission;
}

export interface ICreateUserPermission {
    user_id: number;
    permission_id: number;
    level: string;
    expires_at?: string;
}

export interface IUpdateUserPermission extends ICreateUserPermission {

}