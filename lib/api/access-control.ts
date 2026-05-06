// Comprehensive client-safe API layer for all access control operations
// This file completely separates server and client code

import { clientFetch } from './client-fetch';

// Navigation Menus API
export const menusApi = {
  // Queries
  list: (params?: any) => clientFetch.get('/api/access_control/menus', { params }),
  getById: (id: string | number) => clientFetch.get(`/api/access_control/menus/${id}`),
  
  // Actions
  create: (data: any) => clientFetch.post('/api/access_control/menus', data),
  update: (id: string | number, data: any) => clientFetch.put(`/api/access_control/menus/${id}`, data),
  delete: (id: string | number) => clientFetch.delete(`/api/access_control/menus/${id}`),
};

// Menu Permissions API
export const menuPermissionsApi = {
  list: (params?: any) => clientFetch.get('/api/access_control/menu-permissions', { params }),
  getById: (menuId: string | number, permissionId: string | number) => 
    clientFetch.get(`/api/access_control/menu-permissions/${menuId}/${permissionId}`),
  create: (menuId: string | number, permissionId: string | number, data: any) => 
    clientFetch.post(`/api/access_control/menu-permissions/${menuId}/${permissionId}`, data),
  update: (menuId: string | number, permissionId: string | number, data: any) => 
    clientFetch.put(`/api/access_control/menu-permissions/${menuId}/${permissionId}`, data),
  delete: (menuId: string | number, permissionId: string | number) => 
    clientFetch.delete(`/api/access_control/menu-permissions/${menuId}/${permissionId}`),
};

// Role Menus API
export const roleMenusApi = {
  list: (params?: any) => clientFetch.get('/api/access_control/role-menus', { params }),
  getById: (roleId: string | number, menuId: string | number) => 
    clientFetch.get(`/api/access_control/role-menus/${roleId}/${menuId}`),
  create: (roleId: string | number, menuId: string | number, data: any) => 
    clientFetch.post(`/api/access_control/role-menus/${roleId}/${menuId}`, data),
  update: (roleId: string | number, menuId: string | number, data: any) => 
    clientFetch.put(`/api/access_control/role-menus/${roleId}/${menuId}`, data),
  delete: (roleId: string | number, menuId: string | number) => 
    clientFetch.delete(`/api/access_control/role-menus/${roleId}/${menuId}`),
};

// Security - Roles API
export const rolesApi = {
  list: (params?: any) => clientFetch.get('/api/access_control/roles', { params }),
  getById: (id: string | number) => clientFetch.get(`/api/access_control/roles/${id}`),
  create: (data: any) => clientFetch.post('/api/access_control/roles', data),
  update: (id: string | number, data: any) => clientFetch.put(`/api/access_control/roles/${id}`, data),
  delete: (id: string | number) => clientFetch.delete(`/api/access_control/roles/${id}`),
};

// Security - Permissions API
export const permissionsApi = {
  list: (params?: any) => clientFetch.get('/api/access_control/permissions', { params }),
  getById: (id: string | number) => clientFetch.get(`/api/access_control/permissions/${id}`),
  create: (data: any) => clientFetch.post('/api/access_control/permissions', data),
  update: (id: string | number, data: any) => clientFetch.put(`/api/access_control/permissions/${id}`, data),
  delete: (id: string | number) => clientFetch.delete(`/api/access_control/permissions/${id}`),
};

// Security - Applications API
export const applicationsApi = {
  list: (params?: any) => clientFetch.get('/api/access_control/applications', { params }),
  getById: (id: string | number) => clientFetch.get(`/api/access_control/applications/${id}`),
  create: (data: any) => clientFetch.post('/api/access_control/applications', data),
  update: (id: string | number, data: any) => clientFetch.put(`/api/access_control/applications/${id}`, data),
  delete: (id: string | number) => clientFetch.delete(`/api/access_control/applications/${id}`),
};

// Security - Role Permissions API
export const rolePermissionsApi = {
  list: (params?: any) => clientFetch.get('/api/access_control/role-permissions', { params }),
  getById: (roleId: string | number, permissionId: string | number) => 
    clientFetch.get(`/api/access_control/role-permissions/${roleId}/${permissionId}`),
  create: (roleId: string | number, permissionId: string | number, data: any) => 
    clientFetch.post(`/api/access_control/role-permissions/${roleId}/${permissionId}`, data),
  update: (roleId: string | number, permissionId: string | number, data: any) => 
    clientFetch.put(`/api/access_control/role-permissions/${roleId}/${permissionId}`, data),
  delete: (roleId: string | number, permissionId: string | number) => 
    clientFetch.delete(`/api/access_control/role-permissions/${roleId}/${permissionId}`),
};

// Security - Modules Applications API
export const modulesApplicationsApi = {
  list: (params?: any) => clientFetch.get('/api/access_control/modules-applications', { params }),
  getById: (moduleId: string | number, applicationId: string | number) => 
    clientFetch.get(`/api/access_control/modules-applications/${moduleId}/${applicationId}`),
  create: (moduleId: string | number, applicationId: string | number, data: any) => 
    clientFetch.post(`/api/access_control/modules-applications/${moduleId}/${applicationId}`, data),
  update: (moduleId: string | number, applicationId: string | number, data: any) => 
    clientFetch.put(`/api/access_control/modules-applications/${moduleId}/${applicationId}`, data),
  delete: (moduleId: string | number, applicationId: string | number) => 
    clientFetch.delete(`/api/access_control/modules-applications/${moduleId}/${applicationId}`),
};

// Security - Policies API
export const policiesApi = {
  list: (params?: any) => clientFetch.get('/api/access_control/policies', { params }),
  getById: (id: string | number) => clientFetch.get(`/api/access_control/policies/${id}`),
  create: (data: any) => clientFetch.post('/api/access_control/policies', data),
  update: (id: string | number, data: any) => clientFetch.put(`/api/access_control/policies/${id}`, data),
  delete: (id: string | number) => clientFetch.delete(`/api/access_control/policies/${id}`),
};

// Account - Users API
export const usersApi = {
  list: (params?: any) => clientFetch.get('/api/access_control/users', { params }),
  getById: (id: string | number) => clientFetch.get(`/api/access_control/users/${id}`),
  create: (data: any) => clientFetch.post('/api/access_control/users', data),
  update: (id: string | number, data: any) => clientFetch.put(`/api/access_control/users/${id}`, data),
  delete: (id: string | number) => clientFetch.delete(`/api/access_control/users/${id}`),
};

// Account - Clients API
export const clientsApi = {
  list: (params?: any) => clientFetch.get('/api/access_control/clients', { params }),
  getById: (id: string | number) => clientFetch.get(`/api/access_control/clients/${id}`),
  create: (data: any) => clientFetch.post('/api/access_control/clients', data),
  update: (id: string | number, data: any) => clientFetch.put(`/api/access_control/clients/${id}`, data),
  delete: (id: string | number) => clientFetch.delete(`/api/access_control/clients/${id}`),
};

// Account - Companies API
export const companiesApi = {
  list: (params?: any) => clientFetch.get('/api/access_control/companies', { params }),
  getById: (id: string | number) => clientFetch.get(`/api/access_control/companies/${id}`),
  create: (data: any) => clientFetch.post('/api/access_control/companies', data),
  update: (id: string | number, data: any) => clientFetch.put(`/api/access_control/companies/${id}`, data),
  delete: (id: string | number) => clientFetch.delete(`/api/access_control/companies/${id}`),
};

// Account - Profiles API
export const profilesApi = {
  list: (params?: any) => clientFetch.get('/api/access_control/profiles', { params }),
  getById: (id: string | number) => clientFetch.get(`/api/access_control/profiles/${id}`),
  create: (data: any) => clientFetch.post('/api/access_control/profiles', data),
  update: (id: string | number, data: any) => clientFetch.put(`/api/access_control/profiles/${id}`, data),
  delete: (id: string | number) => clientFetch.delete(`/api/access_control/profiles/${id}`),
};
