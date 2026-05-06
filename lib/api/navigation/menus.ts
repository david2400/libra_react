// Client-safe API layer for navigation menus
// This file can be safely imported by client components

import { clientFetch } from '../client-fetch';

// Export only the action functions that are safe for client use
export const menuApi = {
  create: async (data: any) => {
    return await clientFetch.post('/api/menus', data);
  },
  
  update: async (id: string | number, data: any) => {
    return await clientFetch.put(`/api/menus/${id}`, data);
  },
  
  delete: async (id: string | number) => {
    return await clientFetch.delete(`/api/menus/${id}`);
  }
} as const;
