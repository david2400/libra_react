'use client';

import type { 
  IRole, 
  IRoleCreateRequest, 
  IRoleUpdateRequest,
} from '../models/role.interface';

// Client-safe API wrapper for role operations
export class RolesAPI {
  private static baseUrl = '/api/security/roles';

  static async create(payload: IRoleCreateRequest): Promise<IRole> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create role' }));
      throw new Error(error.message || 'Failed to create role');
    }

    return response.json();
  }

  static async update(id: string | number, payload: IRoleUpdateRequest): Promise<IRole> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update role' }));
      throw new Error(error.message || 'Failed to update role');
    }

    return response.json();
  }

  static async delete(id: string | number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete role' }));
      throw new Error(error.message || 'Failed to delete role');
    }
  }

  static async getById(id: string | number): Promise<IRole> {
    const response = await fetch(`${this.baseUrl}/${id}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch role' }));
      throw new Error(error.message || 'Failed to fetch role');
    }

    return response.json();
  }

  static async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    data: IRole[];
    total: number;
    page: number;
    limit: number;
  }> {
    const url = new URL(this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch roles' }));
      throw new Error(error.message || 'Failed to fetch roles');
    }

    return response.json();
  }
}
