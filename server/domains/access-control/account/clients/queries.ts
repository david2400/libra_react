import 'server-only';
import { cache } from 'react';

import { clientsRepository, clientCompaniesRepository, clientAuthRepository, clientStatsRepository, clientActivityRepository } from './repository';
import type { ListParams } from '@/server/lib/types';

// ─── Clients Queries ─────────────────────────────────────────────────────────

export const getClients = cache((params?: ListParams) => 
  clientsRepository.list(params)
);

export const getClientById = cache((id: string | number) => 
  clientsRepository.getById(id)
);

export const getActiveClients = cache(() => 
  clientsRepository.getActive()
);

// ─── Client Companies Queries ─────────────────────────────────────────────────

export const getClientCompanies = cache((params?: ListParams) => 
  clientCompaniesRepository.list(params)
);

export const getCompaniesByClient = cache((clientId: string | number) => 
  clientCompaniesRepository.getCompaniesByClient(clientId)
);

export const getClientsByCompany = cache((companyId: string | number) => 
  clientCompaniesRepository.getClientsByCompany(companyId)
);

export const getPrimaryCompany = cache((clientId: string | number) => 
  clientCompaniesRepository.getPrimaryCompany(clientId)
);

// ─── Client Stats Queries ─────────────────────────────────────────────────────

export const getClientStats = cache((clientId: string | number) => 
  clientStatsRepository.getStats(clientId)
);

export const getAllClientStats = cache(() => 
  clientStatsRepository.getAllStats()
);

export const getClientOverview = cache((clientId: string | number) => 
  clientStatsRepository.getOverview(clientId)
);

// ─── Client Activity Queries ─────────────────────────────────────────────────

export const getClientActivities = cache((params?: ListParams) => 
  clientActivityRepository.list(params)
);

export const getActivitiesByClient = cache((clientId: string | number, params?: ListParams) => 
  clientActivityRepository.getByClient(clientId, params)
);

export const getRecentActivities = cache((clientId: string | number, limit?: number) => 
  clientActivityRepository.getRecent(clientId, limit)
);
