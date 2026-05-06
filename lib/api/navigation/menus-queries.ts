// Client-safe API layer for navigation menu queries
// This file can be safely imported by client components

import { clientFetch } from '../client-fetch';

// Export only the query functions that are safe for client use
export const menuQueriesApi = {
  list: async (params?: any) => {
    return await clientFetch.get('/api/menus', params);
  },
  
  getById: async (id: string | number) => {
    return await clientFetch.get(`/api/menus/${id}`);
  }
} as const;
