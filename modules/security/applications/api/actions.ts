// Client-safe API layer for applications actions
// This file only re-exports server actions to avoid server-only import issues

export { 
  createApplicationAction,
  updateApplicationAction,
  deleteApplicationAction
} from '@/server/domains/access-control/security/applications/actions';
