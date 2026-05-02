import type { clients } from '@/server/domains/access-control/account';

export type IClientCreateRequest = clients.ICreateClientPayload;
export type IClientUpdateRequest = clients.IUpdateClientPayload & { id: string | number };
export type IClient = clients.IClient;
