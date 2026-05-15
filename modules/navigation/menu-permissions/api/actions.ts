// Client-safe API layer for menu permissions actions
// This file only re-exports server actions to avoid server-only import issues

export { 
  createMenuPermissionAction,
  updateMenuPermissionAction,
  deleteMenuPermissionAction
} from '@/server/domains/access-control/navigation/menu_permissions/actions';
