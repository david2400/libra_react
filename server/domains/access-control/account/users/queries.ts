import 'server-only';
import { cache } from 'react';

import { 
  usersRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { 
  IUser,
  ICreateUser,
  IUpdateUser,
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
    is_active: user.status === 'ACTIVE',
    last_login: user.last_login,
    has_refresh_token: !!user.refresh_token
  };
});

// Get users list with summary
export const getUsersWithSummary = cache(async (params?: IUserListParams) => {
  const [users] = await Promise.all([
    getUsers(params)
  ]);
  
  // Process users data
  const processedUsers = users.content.map((user: IUser) => ({
    ...user,
    isActive: user.status === 'ACTIVE',
    days_since_last_login: user.last_login ? 
      Math.floor((Date.now() - new Date(user.last_login).getTime()) / (1000 * 60 * 60 * 24)) : null,
    has_refresh_token: !!user.refresh_token
  }));
  
  return {
    users: processedUsers,
    summary: {
      total: users.total_elements,
      active: processedUsers.filter(u => u.deleted).length,
      with_refresh_token: processedUsers.filter(u => u.has_refresh_token).length,
      logged_in_recently: processedUsers.filter(u => 
        u.days_since_last_login !== null && u.days_since_last_login <= 7
      ).length
    }
  };
});
