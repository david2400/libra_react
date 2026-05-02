import type { users } from '@/server/domains/access-control/account';

export type IUserCreateRequest = users.ICreateUserPayload;
export type IUserUpdateRequest = users.IUpdateUserPayload & { id_user: number };
export type IUser = users.IUser;
