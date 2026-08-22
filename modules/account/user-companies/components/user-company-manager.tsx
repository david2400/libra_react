/** @format */

"use client";

import { useState, useMemo, useEffect } from "react";
import {
  HiSearch,
  HiCheck,
  HiX,
  HiPlus,
  HiMinus,
  HiFilter,
  HiRefresh,
  HiOfficeBuilding,
  HiUserGroup,
  HiCheckCircle,
} from "react-icons/hi";
import { IUser } from "@/server/domains/access-control/account/users";
import { ICompany } from "@/server/domains/access-control/account/companies";
import Swal from "sweetalert2";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/inputs/scenes/select";
import { useCompanyData } from "../hooks/use-company-data";
import { IUserCompany, IUserCompanyWithDetails } from "../models/user-company.interface";
import {
  createUserCompanyServerAction,
  deleteUserCompanyServerAction,
  getUserCompaniesServerAction,
} from "@/app/[locale]/(protected)/account/user-companies/actions";

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
  const [filterMode, setFilterMode] = useState<"all" | "assigned" | "unassigned">("all");
  const [pendingCompanyIds, setPendingCompanyIds] = useState<Set<number>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (typeof props?.companyId === "number") return;

    const userId = selectedUser?.id_user;
    if (userId === undefined) return;

    let cancelled = false;
    getUserCompaniesServerAction(userId)
      .then((data) => {
        if (cancelled) return;
        const companyIds = data
          .map((uc) => Number(uc.company_id))
          .filter(Number.isFinite);
        setUserAssignments((prev) => ({ ...prev, [userId]: companyIds }));
      })
      .catch((error) => {
        console.error("Error cargando empresas del usuario:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedUser?.id_user, props?.companyId]);

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

  const showError = (message: string) => {
    Swal.fire({ title: "Error!", text: message, icon: "error" });
  };

  const setPending = (companyId: number, pending: boolean) => {
    setPendingCompanyIds((prev) => {
      const next = new Set(prev);
      if (pending) {
        next.add(companyId);
      } else {
        next.delete(companyId);
      }
      return next;
    });
  };

  const toggleCompany = async (companyId: number) => {
    if (!selectedUser || selectedUser.id_user === undefined) return;

    const userId = Number(selectedUser.id_user);
    const targetCompanyId = Number(companyId);
    if (!Number.isFinite(userId) || !Number.isFinite(targetCompanyId)) {
      showError("No se pudo identificar el usuario o la empresa");
      return;
    }

    const isAssigned = (userAssignments[userId] || []).includes(targetCompanyId);

    setPending(targetCompanyId, true);
    try {
      if (isAssigned) {
        await deleteUserCompanyServerAction(userId, targetCompanyId);
        setUserAssignments((prev) => ({
          ...prev,
          [userId]: (prev[userId] || []).filter((id) => id !== targetCompanyId),
        }));
      } else {
        const created = await createUserCompanyServerAction({
          user_id: userId,
          company_id: targetCompanyId,
          is_primary: false,
        });
        if (created) {
          setUserAssignments((prev) => ({
            ...prev,
            [userId]: [...(prev[userId] || []), targetCompanyId],
          }));
        }
      }
    } catch (error: any) {
      showError(error?.message || "No se pudo actualizar la asignación");
    } finally {
      setPending(targetCompanyId, false);
    }
  };

  const assignAll = async () => {
    if (!selectedUser || selectedUser.id_user === undefined) return;

    const userId = Number(selectedUser.id_user);
    if (!Number.isFinite(userId)) {
      showError("No se pudo identificar el usuario");
      return;
    }

    const current = userAssignments[userId] || [];
    const missing = companies
      .map((company) => Number(company.id_company))
      .filter((companyId) => Number.isFinite(companyId) && !current.includes(companyId));

    missing.forEach((companyId) => setPending(companyId, true));
    try {
      const created = await Promise.all(
        missing.map((companyId) =>
          createUserCompanyServerAction({
            user_id: userId,
            company_id: companyId,
            is_primary: false,
          }),
        ),
      );
      const successful = missing.filter((_, i) => !!created[i]);
      setUserAssignments((prev) => ({
        ...prev,
        [userId]: [...(prev[userId] || []), ...successful],
      }));
    } catch (error: any) {
      showError(error?.message || "No se pudieron asignar todas las empresas");
    } finally {
      missing.forEach((companyId) => setPending(companyId, false));
    }
  };

  const removeAll = async () => {
    if (!selectedUser || selectedUser.id_user === undefined) return;

    const userId = Number(selectedUser.id_user);
    if (!Number.isFinite(userId)) {
      showError("No se pudo identificar el usuario");
      return;
    }

    const assigned = userAssignments[userId] || [];
    const toRemove = assigned.filter(Number.isFinite);

    toRemove.forEach((companyId) => setPending(companyId, true));
    try {
      await Promise.all(
        toRemove.map((companyId) => deleteUserCompanyServerAction(userId, companyId)),
      );
      setUserAssignments((prev) => ({
        ...prev,
        [userId]: [],
      }));
    } catch (error: any) {
      showError(error?.message || "No se pudieron remover todas las empresas");
    } finally {
      toRemove.forEach((companyId) => setPending(companyId, false));
    }
  };

  const handleRefresh = async () => {
    if (!selectedUser || selectedUser.id_user === undefined) return;

    const userId = Number(selectedUser.id_user);
    if (!Number.isFinite(userId)) {
      showError("No se pudo identificar el usuario");
      return;
    }

    setIsRefreshing(true);
    try {
      const data = await getUserCompaniesServerAction(userId);
      const companyIds = data
        .map((uc) => Number(uc.company_id))
        .filter(Number.isFinite);
      setUserAssignments((prev) => ({ ...prev, [userId]: companyIds }));
    } catch (error: any) {
      showError(error?.message || "No se pudo actualizar las asignaciones");
    } finally {
      setIsRefreshing(false);
    }
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
              <h1 className='text-3xl font-bold tracking-tight text-foreground'>
                Asignar Empresas a Usuarios
              </h1>
              <p className='mt-1.5 text-base text-muted-foreground'>
                Gestiona las empresas asignadas a cada usuario
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={handleRefresh}
                disabled={!selectedUser || isRefreshing}
                className='flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50'>
                <HiRefresh className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Actualizar
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
              <Select
                value={selectedUser ? String(selectedUser.id_user) : ""}
                onValueChange={(value) => {
                  const id = Number(value);
                  const user = users.find((u) => u.id_user === id) || null;
                  setSelectedUser(user);
                }}
                disabled={filteredUsers.length === 0}>
                <SelectTrigger className='mt-1 w-full h-12 rounded-xl border border-border bg-card text-base'>
                  <SelectValue placeholder='Seleccionar usuario...' />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsers.map((user) => (
                    <SelectItem
                      key={user.id_user}
                      value={String(user.id_user)}>
                      <span className='flex items-center gap-2'>
                        {user.username} {user.status ? `- ${user.status}` : ""}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
                  className='flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50'>
                  <HiPlus className='h-4 w-4' />
                  Asignar Todas
                </button>
                <button
                  onClick={removeAll}
                  disabled={!selectedUser}
                  className='flex w-full items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm transition-all duration-200 hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50'>
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
                  className='h-12 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30 focus:border-ring focus:outline-none'
                />
              </div>

              <div className='flex items-center gap-2'>
                <HiFilter className='h-5 w-5 text-muted-foreground' />
                <div className='flex rounded-lg border border-border bg-card p-1'>
                  {(["all", "assigned", "unassigned"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFilterMode(mode)}
                      className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200 ${filterMode === mode
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card text-muted-foreground hover:border-primary/50"
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
                    isPending={pendingCompanyIds.has(company.id_company)}
                    onToggle={() => toggleCompany(company.id_company)}
                    disabled={!selectedUser || pendingCompanyIds.has(company.id_company)}
                  />
                );
              })}
            </div>

            {filteredCompanies.length === 0 && (
              <div className='flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-12'>
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
  isPending,
  onToggle,
  disabled,
}: {
  company: ICompany;
  isAssigned: boolean;
  isPending: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md ${isAssigned
          ? "border-primary/50"
          : "border-border hover:border-primary/50"
        }`}>
      <div>
        <div className='flex items-start gap-4'>
          <div
            className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary'>
            <HiOfficeBuilding className='h-6 w-6 text-primary' />
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
            disabled={disabled || isPending}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${isAssigned
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-border bg-secondary text-secondary-foreground hover:border-primary hover:text-primary"
              }`}>
            {isPending ? (
              "..."
            ) : isAssigned ? (
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
