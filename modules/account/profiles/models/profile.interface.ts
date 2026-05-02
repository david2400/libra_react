import type { profiles } from '@/server/domains/access-control/account';

export type IProfileCreateRequest = profiles.ICreateProfilePayload;
export type IProfileUpdateRequest = profiles.IUpdateProfilePayload & { id: string | number };
export type IProfile = profiles.IProfile;
