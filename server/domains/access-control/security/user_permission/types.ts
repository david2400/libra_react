import { IUser } from "../../account/users";
import { IPermission } from "../permissions";

export interface IUserPermission {
    user_id: string | number;
    permission_id: string | number;
    is_active?: boolean;
    user?: IUser;
    permission?: IPermission;
}

export interface ICreateUserPermission {
    user_id: string | number;
    permission_id: string | number;
    is_active?: boolean;
}

export interface IUpdateUserPermission {
    is_active?: boolean;
}