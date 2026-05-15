// Client-safe API layer for role menus actions
// This file only re-exports server actions to avoid server-only import issues

export { 
  createRoleMenuAction,
  updateRoleMenuAction,
  deleteRoleMenuAction
} from '@/server/domains/access-control/navigation/role_menus/actions';
