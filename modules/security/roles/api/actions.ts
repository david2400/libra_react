// Client-safe API layer for roles actions
// This file only re-exports server actions to avoid server-only import issues

export { 
  createRoleAction,
  updateRoleAction,
  deleteRoleAction
} from '@/server/domains/access-control/security/roles/actions';
