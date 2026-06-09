/**
 * Módulo de Clients con gestión integrada de Users
 * 
 * Este módulo sigue los principios SOLID:
 * - Single Responsibility: Cada componente tiene una responsabilidad única
 * - Open/Closed: Extensible mediante props sin modificar componentes
 * - Liskov Substitution: Los componentes pueden ser reemplazados por sus variantes
 * - Interface Segregation: Interfaces específicas para cada caso de uso
 * - Dependency Inversion: Dependencias mediante props e inyección
 */

// Components
export { ClientManager } from './components/client-manager';
export { ClientDetailModal } from './components/client-detail-modal';
export { ClientUsersSection } from './components/client-users-section';
export { CompanySelector } from './components/company-selector';
export { RegisterClient, UpdateClient } from './components/form';

// Hooks
export { useClientUsers } from './hooks/use-client-users';

// Models
export type { IClient, IClientCreateRequest, IClientUpdateRequest } from './models/client.interface';
