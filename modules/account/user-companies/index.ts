/** @format */

/**
 * Módulo de User-Companies para asignación de empresas a usuarios
 * 
 * Este módulo sigue los principios SOLID:
 * - Single Responsibility: Cada componente tiene una responsabilidad única
 * - Open/Closed: Extensible mediante props sin modificar componentes
 * - Liskov Substitution: Los componentes pueden ser reemplazados por sus variantes
 * - Interface Segregation: Interfaces específicas para cada caso de uso
 * - Dependency Inversion: Dependencias mediante props e inyección
 */

// Components
export { UserCompaniesManager as UserCompanyManager } from "./components/user-company-manager";
export { RegisterUserCompany, UpdateUserCompany } from "./components/form";

// Scenes
export { FormUserCompany } from "./scenes/formUserCompany";

// Models
export type {
  IUserCompany,
  IUserCompanyCreateRequest,
  IUserCompanyUpdateRequest,
  IUserCompanyWithDetails,
} from "./models/user-company.interface";

// Schemas
export {
  validationUserCompany,
  validationUpdateUserCompany,
} from "./schemas/user-company.schema";
