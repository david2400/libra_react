// --- Company Applications Module -----------------------------------------------

// Types
export * from './types';

// Repository
export { companyApplicationsRepository } from './repository';

// Queries
export {
  getCompanyApplications,
  getCompanyApplicationById,
  getActiveCompanyApplications,
  getApplicationsByCompany,
  getActiveApplicationsByCompany,
  getCompanyApplicationProfile,
  getCompanyApplicationPortfolio,
  getCompanyLicenseExpirations,
  getApplicationUsageStats,
  getCompanyApplicationHealth,
} from './queries';

// Actions
export {
  createCompanyApplicationAction,
  updateCompanyApplicationAction,
  deleteCompanyApplicationAction,
  activateLicenseAction,
  deactivateLicenseAction,
  assignApplicationToCompanyAction,
  revokeApplicationFromCompanyAction,
} from './actions';
