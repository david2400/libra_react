import type { users } from '@/server/domains/access-control/account';

export type IUserCreateRequest = users.ICreateUser;
export type IUserUpdateRequest = users.IUpdateUser & { id_user: number };
export type IUser = users.IUser;
