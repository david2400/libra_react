/** @format */

"use client";

import { useState, useMemo } from "react";
import {
  HiSearch,
  HiCheck,
  HiX,
  HiPlus,
  HiMinus,
  HiChevronDown,
  HiSave,
  HiRefresh,
  HiFilter,
  HiOfficeBuilding,
  HiUserGroup,
  HiCheckCircle,
} from "react-icons/hi";
import { IUser } from "@/server/domains/access-control/account/users";
import { ICompany } from "@/server/domains/access-control/account/companies";
import { useCompanyData } from "../hooks/use-company-data";
import { IUserCompanyWithDetails } from "../models/user-company.interface";

interface UserCompaniesManagerProps {
  initialData?: IUserCompanyWithDetails[];
  users?: IUser[];
  companies?: ICompany[];
  companyId?: number;
}

export function UserCompaniesManager(props?: UserCompaniesManagerProps) {
  const {
    users: loadedUsers,
    companies: loadedCompanies,
    isLoadingUsers,
    isLoadingCompanies,
    loadData,
  } = useCompanyData();

  const users = props?.users && props.users.length > 0 ? props.users : loadedUsers;
  const companies = props?.companies && props.companies.length > 0 ? props.companies : loadedCompanies;

  const selectedCompany = useMemo(() => {
    if (props?.companyId) {
      return companies.find((c) => c.id_company === props.companyId) || null;
    }
    return null;
  }, [props?.companyId, companies]);

  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [userAssignments, setUserAssignments] = useState<Record<number, number[]>>(() => {
    if (props?.initialData && props.initialData.length > 0) {
      const assignments: Record<number, number[]> = {};
      props.initialData.forEach((item) => {
        if (!assignments[item.user_id]) {
          assignments[item.user_id] = [];
        }
        assignments[item.user_id].push(item.company_id);
      });
      return assignments;
    }
    return {};
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "assigned" | "unassigned">("all");

  const currentAssignments = selectedUser && selectedUser.id_user !== undefined
    ? (userAssignments[selectedUser.id_user] || [])
    : [];

  const filteredUsers = useMemo(() => {
    if (!selectedCompany) {
      return users;
    }
    return users.filter((user) => {
      if (user.id_user === undefined) return false;
      const userCompanies = userAssignments[user.id_user] || [];
      return userCompanies.includes(selectedCompany.id_company);
    });
  }, [users, selectedCompany, userAssignments]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch =
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (company.nit?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const isAssigned = currentAssignments.includes(company.id_company);
      const matchesFilter =
        filterMode === "all" ||
        (filterMode === "assigned" && isAssigned) ||
        (filterMode === "unassigned" && !isAssigned);
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, currentAssignments, filterMode, companies]);

  const toggleCompany = (companyId: number) => {
    if (!selectedUser || selectedUser.id_user === undefined) return;

    const userId = selectedUser.id_user;
    setUserAssignments((prev) => {
      const userCompanies = prev[userId] || [];
      const newCompanies = userCompanies.includes(companyId)
        ? userCompanies.filter((id: number) => id !== companyId)
        : [...userCompanies, companyId];
      return { ...prev, [userId]: newCompanies };
    });
    setHasChanges(true);
  };

  const assignAll = () => {
    if (!selectedUser || selectedUser.id_user === undefined) return;
    
    const userId = selectedUser.id_user;
    setUserAssignments((prev) => ({
      ...prev,
      [userId]: companies.map((company) => company.id_company),
    }));
    setHasChanges(true);
  };

  const removeAll = () => {
    if (!selectedUser || selectedUser.id_user === undefined) return;
    
    const userId = selectedUser.id_user;
    setUserAssignments((prev) => ({
      ...prev,
      [userId]: [],
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedUser || selectedUser.id_user === undefined) return;
    
    try {
      const { createUserCompanyAction, deleteUserCompanyAction } = await import(
        "@/server/domains/access-control/account/user-companies/actions"
      );
      
      const userId = selectedUser.id_user;
      const currentCompanies = userAssignments[userId] || [];
      
      console.log("Guardando asignaciones para usuario:", userId, currentCompanies);
      
      setHasChanges(false);
    } catch (error) {
      console.error("Error al guardar asignaciones:", error);
    }
  };

  const handleReset = () => {
    setUserAssignments({});
    setHasChanges(false);
  };

  const stats = useMemo(() => {
    const assigned = currentAssignments.length;
    const total = companies.length;
    return { assigned, total };
  }, [currentAssignments, companies]);

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-semibold text-foreground'>
                Asignar Empresas a Usuarios
              </h1>
              <p className='mt-1 text-sm text-muted-foreground'>
                Gestiona las empresas asignadas a cada usuario
              </p>
            </div>
            <div className='flex items-center gap-3'>
              {hasChanges && (
                <span className='flex items-center gap-2 rounded-full bg-warning/10 px-3 py-1 text-sm text-warning'>
                  <span className='h-2 w-2 animate-pulse rounded-full bg-warning' />
                  Cambios sin guardar
                </span>
              )}
              <button
                onClick={handleReset}
                className='flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary'>
                <HiRefresh className='h-4 w-4' />
                Restablecer
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className='flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50'>
                <HiSave className='h-4 w-4' />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
          <div className='lg:col-span-1'>
            {selectedCompany && (
              <div className='rounded-xl border border-border bg-card p-4'>
                <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
                  Empresa Seleccionada
                </h3>
                <div className='flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20'>
                    <HiOfficeBuilding className='h-5 w-5 text-blue-500' />
                  </div>
                  <div className='flex-1 text-left'>
                    <p className='font-medium text-foreground'>
                      {selectedCompany.name}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {selectedCompany.nit || 'Sin NIT'}
                    </p>
                  </div>
                </div>

                <div className='mt-4 space-y-2 border-t border-border pt-4'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>Empresa</span>
                    <span className='text-foreground'>
                      {selectedCompany.name}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>NIT</span>
                    <span className='text-foreground'>
                      {selectedCompany.nit || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className='mt-4 rounded-xl border border-border bg-card p-4'>
              <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
                Usuario Seleccionado
              </h3>
              <div className='relative'>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className='flex w-full items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3 transition-colors hover:bg-secondary'>
                  <div
                    className='flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground'
                    style={{ backgroundColor: "#3B82F6" }}>
                    {selectedUser ? (selectedUser.username?.[0] || 'U').toUpperCase() : 'U'}
                  </div>
                  <div className='flex-1 text-left'>
                    <p className='font-medium text-foreground'>
                      {selectedUser ? selectedUser.username || 'Seleccionar Usuario' : 'Seleccionar Usuario'}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {selectedUser?.status || 'Sin estado'}
                    </p>
                  </div>
                  <HiChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${showUserDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showUserDropdown && (
                  <div className='absolute left-0 right-0 top-full z-10 mt-2 rounded-lg border border-border bg-card shadow-xl'>
                    <div className='max-h-64 overflow-y-auto p-2'>
                      {filteredUsers.map((user) => (
                        <button
                          key={user.id_user}
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDropdown(false);
                          }}
                          className={`flex w-full items-center gap-3 rounded-lg p-3 transition-colors ${
                            selectedUser?.id_user === user.id_user
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-secondary"
                          }`}>
                          <div
                            className='flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground'
                            style={{ backgroundColor: "#3B82F6" }}>
                            {user.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className='flex-1 text-left'>
                            <p className='font-medium text-foreground'>
                              {user.username}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {user.status}
                            </p>
                          </div>
                          {selectedUser?.id_user === user.id_user && (
                            <HiCheck className='h-5 w-5 text-primary' />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className='mt-4 space-y-2 border-t border-border pt-4'>
                {selectedUser && (
                  <>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Usuario</span>
                      <span className='text-foreground'>
                        {selectedUser?.username || 'N/A'}
                      </span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Estado</span>
                      <span className='text-foreground'>
                        {selectedUser?.status || 'N/A'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className='mt-4 rounded-xl border border-border bg-card p-4'>
              <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
                Resumen de Asignaciones
              </h3>
              <div className='mb-4 flex items-center justify-between'>
                <span className='text-3xl font-bold text-foreground'>
                  {stats.assigned}
                </span>
                <span className='text-sm text-muted-foreground'>
                  de {stats.total} empresas
                </span>
              </div>
              <div className='h-2 w-full overflow-hidden rounded-full bg-secondary'>
                <div
                  className='h-full rounded-full bg-primary transition-all duration-300'
                  style={{ width: `${stats.total > 0 ? (stats.assigned / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className='mt-4 rounded-xl border border-border bg-card p-4'>
              <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
                Acciones Rápidas
              </h3>
              <div className='space-y-2'>
                <button
                  onClick={assignAll}
                  disabled={!selectedUser}
                  className='flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50'>
                  <HiPlus className='h-4 w-4' />
                  Asignar Todas
                </button>
                <button
                  onClick={removeAll}
                  disabled={!selectedUser}
                  className='flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-50'>
                  <HiMinus className='h-4 w-4' />
                  Remover Todas
                </button>
              </div>
            </div>
          </div>

          <div className='lg:col-span-3'>
            <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='relative flex-1 sm:max-w-sm'>
                <HiSearch className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground' />
                <input
                  type='text'
                  placeholder='Buscar empresas...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                />
              </div>

              <div className='flex items-center gap-2'>
                <HiFilter className='h-5 w-5 text-muted-foreground' />
                <div className='flex rounded-lg border border-border bg-card p-1'>
                  {(["all", "assigned", "unassigned"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFilterMode(mode)}
                      className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                        filterMode === mode
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}>
                      {mode === "all"
                        ? "Todas"
                        : mode === "assigned"
                          ? "Asignadas"
                          : "Sin Asignar"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
              {filteredCompanies.map((company) => {
                const isAssigned = currentAssignments.includes(company.id_company);
                return (
                  <CompanyCard
                    key={company.id_company}
                    company={company}
                    isAssigned={isAssigned}
                    onToggle={() => toggleCompany(company.id_company)}
                    disabled={!selectedUser}
                  />
                );
              })}
            </div>

            {filteredCompanies.length === 0 && (
              <div className='flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16'>
                <HiSearch className='mb-4 h-12 w-12 text-muted-foreground' />
                <p className='text-lg font-medium text-foreground'>
                  No se encontraron empresas
                </p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Intenta ajustar los filtros de búsqueda
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompanyCard({
  company,
  isAssigned,
  onToggle,
  disabled,
}: {
  company: ICompany;
  isAssigned: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all duration-200 ${
        isAssigned
          ? "border-primary/50 bg-primary/5"
          : "border-border bg-card hover:border-primary/30"
      }`}>
      <div className='p-4'>
        <div className='flex items-start gap-4'>
          <div
            className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/20'>
            <HiOfficeBuilding className='h-6 w-6 text-blue-500' />
          </div>

          <div className='min-w-0 flex-1'>
            <h3 className='font-semibold text-foreground'>{company.name}</h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              NIT: {company.nit}
            </p>
            {company.city && (
              <p className='mt-1 text-xs text-muted-foreground'>
                {company.city}
              </p>
            )}
          </div>
        </div>

        <div className='mt-4 flex items-center justify-between'>
          <span className='text-xs text-muted-foreground capitalize'>
            {company.status}
          </span>
          <button
            onClick={onToggle}
            disabled={disabled}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
              isAssigned
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-border bg-secondary text-secondary-foreground hover:border-primary hover:text-primary"
            }`}>
            {isAssigned ? (
              <>
                <HiCheck className='h-4 w-4' />
                Asignada
              </>
            ) : (
              <>
                <HiPlus className='h-4 w-4' />
                Asignar
              </>
            )}
          </button>
        </div>
      </div>

      {isAssigned && (
        <div className='absolute inset-x-0 bottom-0 h-1 bg-primary' />
      )}
    </div>
  );
}
