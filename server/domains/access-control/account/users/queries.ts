import 'server-only';
import { cache } from 'react';

import { 
  usersRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { 
  IUser,
  ICreateUserPayload,
  IUpdateUserPayload,
  IUserListParams
} from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- Users Queries -------------------------------------------------

export const getUsers = cache((params?: IUserListParams) => 
  usersRepository.list(params)
);

export const getUserById = cache((id: number) => 
  usersRepository.getById(id)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get user with status
export const getUserWithStatus = cache(async (id: number) => {
  const [user] = await Promise.all([
    getUserById(id)
  ]);
  
  return {
    user,
    isActive: user.status === 'ACTIVE',
    lastLogin: user.lastLogin,
    has_refresh_token: !!user.refreshToken
  };
});

// Get users list with summary
export const getUsersWithSummary = cache(async (params?: IUserListParams) => {
  const [users] = await Promise.all([
    getUsers(params)
  ]);
  
  // Process users data
  const processedUsers = users.data.map(user => ({
    ...user,
    isActive: user.status === 'ACTIVE',
    days_since_last_login: user.lastLogin ? 
      Math.floor((Date.now() - new Date(user.lastLogin).getTime()) / (1000 * 60 * 60 * 24)) : null,
    has_refresh_token: !!user.refreshToken
  }));
  
  return {
    users: processedUsers,
    summary: {
      total: users.meta.total,
      active: processedUsers.filter(u => u.isActive).length,
      with_refresh_token: processedUsers.filter(u => u.has_refresh_token).length,
      logged_in_recently: processedUsers.filter(u => 
        u.days_since_last_login !== null && u.days_since_last_login <= 7
      ).length
    }
  };
});
