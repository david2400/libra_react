/** @format */

"use client";

import { useState, useMemo, useEffect } from "react";
import {
  HiSearch,
  HiViewGrid,
  HiLightningBolt,
  HiChartBar,
  HiChatAlt2,
  HiCode,
  HiCurrencyDollar,
  HiUserGroup,
  HiShieldCheck,
  HiChartPie,
  HiClipboardList,
  HiPresentationChartBar,
  HiBriefcase,
  HiMail,
  HiArchive,
  HiServer,
  HiCheck,
  HiX,
  HiPlus,
  HiMinus,
  HiSave,
  HiRefresh,
  HiFilter,
  HiSwitchHorizontal,
} from "react-icons/hi";
import Swal from "sweetalert2";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/inputs/scenes/select";
// TODO: Fix type imports for user-application manager
// import { IUser } from "@/server/domains/access-control/account/users";
// import { IApplication } from "@/server/domains/access-control/security/applications";
// import { IApplicationCategory } from "@/server/domains/access-control/security/application_categories";


function getClientFullName(client?: IUser['client']) {
  if (!client) return '';
  const fullName = [
    client.first_name,
    client.second_name,
    client.first_last_name,
    client.second_last_name,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
  return fullName || client.card_id || '';
}


import { useApplicationData } from "../hooks/use-application-data";
import { IUserApplication } from "../models/user-application.interface";
import {
  getUserApplicationsByUserServerAction,
  assignApplicationToUserServerAction,
  deleteUserApplicationServerAction,
} from "@/app/[locale]/(protected)/security/user-applications/actions";
import { getCompanyApplicationsByCompanyServerAction } from "@/app/[locale]/(protected)/security/company-applications/actions";
import { getAllCompaniesServerAction } from "@/app/[locale]/(protected)/account/companies/actions";
import { getCompanyActiveUsersServerAction } from "@/app/[locale]/(protected)/account/user-companies/actions";
import { IApplication } from "../../applications/models/application.interface";
import { IApplicationCategory } from "../../applications-category/models/applicationCategory.interface";
import { IUser } from "@/server/domains/access-control/account/users";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  HiViewGrid,
  HiLightningBolt,
  HiChartBar,
  HiChatAlt2,
  HiCode,
  HiCurrencyDollar,
  HiUserGroup,
  HiShieldCheck,
  HiChartPie,
  HiClipboardList,
  HiPresentationChartBar,
  HiBriefcase,
  HiMail,
  HiArchive,
  HiServer,
};

export function UserApplicationsManager() {
  // Data from custom hook
  const {
    applications,
    categories,
    isLoadingApps,
    isLoadingCategories,
  } = useApplicationData();

  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);

  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Load companies on mount
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setIsLoadingCompanies(true);
        const result = await getAllCompaniesServerAction();
        setCompanies(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Error loading companies:", error);
        setCompanies([]);
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    loadCompanies();
  }, []);

  // Load users when selected company changes
  useEffect(() => {
    const loadUsers = async () => {
      if (!selectedCompany?.id_company) {
        setUsers([]);
        setSelectedUser(null);
        return;
      }
      try {
        setIsLoadingUsers(true);
        const companyUsers = await getCompanyActiveUsersServerAction(selectedCompany.id_company);
        const mapped = (Array.isArray(companyUsers) ? companyUsers : [])
          .map((uc: any) => {
            const user = uc?.user ?? {
              id_user: uc?.user_id ?? uc?.id_user,
              username: uc?.username ?? uc?.user_name ?? uc?.name,
              client: uc?.client ?? (uc?.user?.client ? uc.user.client : undefined),
            };
            return {
              ...user,
              company_id: selectedCompany.id_company,
            };
          })
          .filter((user: IUser) => user.id_user != null);
        setUsers(mapped);
      } catch (error) {
        console.error("Error loading users:", error);
        setUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    loadUsers();
  }, [selectedCompany]);

  // UI states
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [userApplications, setUserApplications] = useState<Record<number, IUserApplication[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [filterMode, setFilterMode] = useState<"all" | "assigned" | "unassigned">("all");
  const [pendingAppIds, setPendingAppIds] = useState<Set<number>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [companyApplications, setCompanyApplications] = useState<any[]>([]);
  const [isLoadingCompanyApps, setIsLoadingCompanyApps] = useState(false);

  const setPending = (appId: number, pending: boolean) => {
    setPendingAppIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(appId);
      else next.delete(appId);
      return next;
    });
  };

  const showError = (message: string) => {
    Swal.fire({ title: "Error!", text: message, icon: "error" });
  };

  useEffect(() => {
    const loadUserApplications = async () => {
      if (!selectedUser?.id_user) return;
      const userId = selectedUser.id_user;
      try {
        const data = await getUserApplicationsByUserServerAction(userId);
        setUserApplications((prev) => ({
          ...prev,
          [userId]: (data || []) as IUserApplication[],
        }));
      } catch (error) {
        console.error("Error cargando asignaciones del usuario:", error);
      }
    };
    const loadCompanyApplications = async () => {
      const companyId = selectedCompany?.id_company ?? selectedUser?.company_id;
      if (!companyId) {
        setCompanyApplications([]);
        return;
      }
      try {
        setIsLoadingCompanyApps(true);
        const result = await getCompanyApplicationsByCompanyServerAction(companyId);
        setCompanyApplications(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Error cargando aplicaciones de la empresa:", error);
        setCompanyApplications([]);
      } finally {
        setIsLoadingCompanyApps(false);
      }
    };
    loadUserApplications();
    loadCompanyApplications();
  }, [selectedUser, selectedCompany]);

  const currentAssignments = selectedUser?.id_user
    ? (userApplications[selectedUser.id_user] || [])
    : [];
  const currentCompanyApplicationIds = useMemo(
    () => currentAssignments.map((ua) => ua.company_application_id).filter(Boolean),
    [currentAssignments]
  );

  const companyApplicationItems = useMemo(() => {
    return (companyApplications as any[]).map((ca) => {
      const app = (applications as IApplication[]).find(
        (a) => a.id_application === Number(ca.application_id ?? (ca as any).applicationId),
      );
      return {
        ...app,
        id_company_application: Number(ca.id_company_application ?? (ca as any).idCompanyApplication),
        id_application: Number(ca.application_id ?? (ca as any).applicationId),
        name: app?.name ?? `Aplicación ${ca.application_id}`,
        description: app?.description ?? '',
        application_category_id: app?.application_category_id ?? null,
      } as IApplication;
    });
  }, [companyApplications, applications]);

  const filteredCompanyApplications = useMemo(() => {
    return (companyApplicationItems as IApplication[]).filter((app: any) => {
      const matchesSearch =
        app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesCategory =
        selectedCategory === "all" || app.application_category_id === selectedCategory;
      const isAssigned = currentCompanyApplicationIds.includes(app.id_company_application);
      const matchesFilter =
        filterMode === "all" ||
        (filterMode === "assigned" && isAssigned) ||
        (filterMode === "unassigned" && !isAssigned);
      return matchesSearch && matchesCategory && matchesFilter;
    });
  }, [companyApplicationItems, searchQuery, selectedCategory, currentCompanyApplicationIds, filterMode]);

  const toggleApp = async (app: any) => {
    const userId = selectedUser?.id_user;
    if (!userId) {
      showError("Selecciona un usuario antes de asignar o remover una aplicación");
      return;
    }

    const companyApplicationId = Number((app as any).id_company_application);
    const appId = Number(app.id_application);
    if (!Number.isFinite(companyApplicationId) || !Number.isFinite(userId)) {
      showError("No se pudo identificar el usuario o la aplicación");
      return;
    }

    const existing = currentAssignments.find((ua) => ua.company_application_id === companyApplicationId);

    setPending(appId, true);
    try {
      if (existing) {
        if (!Number.isFinite(existing.id_user_application)) {
          showError("No se pudo identificar la asignación a remover");
          return;
        }
        await deleteUserApplicationServerAction(existing.id_user_application);
        setUserApplications((prev) => ({
          ...prev,
          [userId]: (prev[userId] || []).filter(
            (ua) => ua.id_user_application !== existing.id_user_application
          ),
        }));
      } else {
        const created = await assignApplicationToUserServerAction(userId, companyApplicationId);
        if (created) {
          setUserApplications((prev) => ({
            ...prev,
            [userId]: [...(prev[userId] || []), created as IUserApplication],
          }));
        }
      }
    } catch (error: any) {
      showError(error?.message || "No se pudo actualizar la asignación");
    } finally {
      setPending(appId, false);
    }
  };

  const assignAll = async () => {
    const userId = selectedUser?.id_user;
    if (!userId) {
      showError("Selecciona un usuario primero");
      return;
    }
    if (!Number.isFinite(userId)) {
      showError("No se pudo identificar el usuario");
      return;
    }

    const missing = (companyApplicationItems as any[])
      .map((item) => ({ item, companyApplicationId: Number(item.id_company_application), appId: Number(item.id_application) }))
      .filter(({ companyApplicationId }) => Number.isFinite(companyApplicationId) && !currentCompanyApplicationIds.includes(companyApplicationId));

    missing.forEach(({ appId }) => setPending(appId, true));
    try {
      const created = await Promise.all(
        missing.map(({ companyApplicationId }) =>
          assignApplicationToUserServerAction(userId, companyApplicationId)
        )
      );
      setUserApplications((prev) => ({
        ...prev,
        [userId]: [
          ...(prev[userId] || []),
          ...(created.filter(Boolean) as IUserApplication[]),
        ],
      }));
    } catch (error: any) {
      showError(error?.message || "No se pudieron asignar todas las aplicaciones");
    } finally {
      missing.forEach(({ appId }) => setPending(appId, false));
    }
  };

  const removeAll = async () => {
    const userId = selectedUser?.id_user;
    if (!userId) return;
    const toRemove = currentAssignments.filter((ua) => Number.isFinite(ua.id_user_application));

    toRemove.forEach((ua) => {
      const item = (companyApplicationItems as any[]).find(
        (i: any) => i.id_company_application === ua.company_application_id,
      );
      setPending(item?.id_application ?? ua.company_application_id, true);
    });
    try {
      await Promise.all(
        toRemove.map((ua) => deleteUserApplicationServerAction(ua.id_user_application))
      );
      setUserApplications((prev) => ({ ...prev, [userId]: [] }));
    } catch (error: any) {
      showError(error?.message || "No se pudieron remover las aplicaciones");
    } finally {
      toRemove.forEach((ua) => {
        const item = (companyApplicationItems as any[]).find(
          (i: any) => i.id_company_application === ua.company_application_id,
        );
        setPending(item?.id_application ?? ua.company_application_id, false);
      });
    }
  };

  const handleRefresh = async () => {
    if (!selectedUser?.id_user) return;
    const userId = selectedUser.id_user;
    setIsRefreshing(true);
    try {
      const data = await getUserApplicationsByUserServerAction(userId);
      setUserApplications((prev) => ({
        ...prev,
        [userId]: (data || []) as IUserApplication[],
      }));
    } catch (error) {
      console.error("Error refrescando asignaciones:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const stats = useMemo(() => {
    const assigned = currentCompanyApplicationIds.length;
    const total = (companyApplicationItems as any[]).length;
    const byCategory = (categories as IApplicationCategory[])
      .filter((c) => !!c.id_application_category)
      .map((cat) => {
        const catApps = (companyApplicationItems as any[]).filter(
          (app: any) => app.application_category_id === cat.id_application_category,
        );
        return {
          ...cat,
          count: catApps.filter((app: any) => currentCompanyApplicationIds.includes(app.id_company_application)).length,
          total: catApps.length,
        };
      });
    return { assigned, total, byCategory };
  }, [currentCompanyApplicationIds, companyApplicationItems, categories]);

  const getIcon = (iconName?: string) => {
    const IconComponent = iconMap[iconName || ''];
    return IconComponent || HiViewGrid;
  };

  const loading = isLoadingApps || isLoadingCategories || isLoadingCompanies || isLoadingUsers || isLoadingCompanyApps;

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='mx-auto max-w-7xl'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight text-foreground'>
                Asignar Aplicaciones
              </h1>
              <p className='mt-1.5 text-base text-muted-foreground'>
                Gestiona las aplicaciones asignadas a cada usuario
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || !selectedUser}
                className='flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:bg-secondary hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50'>
                <HiRefresh className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
          {/* Sidebar - Company/User Selection */}
          <div className='lg:col-span-1 space-y-4'>
            {/* Company Selector */}
            <div className='bg-card border border-border rounded-2xl shadow-sm p-6'>
              <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
                Empresa
              </h3>
              <Select
                value={selectedCompany ? String(selectedCompany.id_company) : ""}
                onValueChange={(value) => {
                  const id = Number(value);
                  const company = companies.find((c) => c.id_company === id) || null;
                  setSelectedCompany(company);
                }}
                disabled={isLoadingCompanies || companies.length === 0}>
                <SelectTrigger className='mt-1 w-full h-12 rounded-xl border-border bg-card focus:ring-2 focus:ring-ring/30 focus:border-ring text-base py-3'>
                  <SelectValue placeholder='Seleccionar empresa...' />
                </SelectTrigger>
                <SelectContent>
                  {companies
                    .filter((company) => company.id_company != null)
                    .map((company) => (
                      <SelectItem
                        key={company.id_company}
                        value={String(company.id_company)}>
                        {company.name || `Empresa ${company.id_company}`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* User Selector */}
            <div className='bg-card border border-border rounded-2xl shadow-sm p-6'>
              <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
                Usuario
              </h3>
              <Select
                value={selectedUser ? String(selectedUser.id_user) : ""}
                onValueChange={(value) => {
                  const id = Number(value);
                  const user = users.find((u) => u.id_user === id) || null;
                  setSelectedUser(user);
                }}
                disabled={isLoadingUsers || !selectedCompany || users.length === 0}>
                <SelectTrigger className='mt-1 w-full h-12 rounded-xl border-border bg-card focus:ring-2 focus:ring-ring/30 focus:border-ring text-base py-3'>
                  <SelectValue placeholder={selectedCompany ? 'Seleccionar usuario...' : 'Seleccione una empresa'} />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter((user) => user.id_user != null)
                    .map((user) => (
                      <SelectItem
                        key={user.id_user}
                        value={String(user.id_user)}>
                        <span className='flex items-center gap-2'>
                          {user.username + " - " + getClientFullName(user.client)}
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* User Info */}
              <div className='mt-4 space-y-2 border-t border-border pt-4'>
                {selectedUser && (
                  <>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Usuario</span>
                      <span className='text-foreground'>
                        {selectedUser?.username || `Usuario ${selectedUser.id_user}`}
                      </span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Empresa</span>
                      <span className='text-foreground'>
                        {selectedCompany?.name || `Company ${selectedUser?.company_id || ''}`}
                      </span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Cliente</span>
                      <span className='text-foreground'>
                        {getClientFullName(selectedUser?.client) || `Cliente ${selectedUser?.client?.card_id || ''}`}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className='mt-4 bg-card border border-border rounded-2xl shadow-sm p-6'>
              <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
                Resumen de Asignaciones
              </h3>
              <div className='mb-4 flex items-center justify-between'>
                <span className='text-3xl font-bold text-foreground'>
                  {stats.assigned}
                </span>
                <span className='text-sm text-muted-foreground'>
                  de {stats.total} apps
                </span>
              </div>
              <div className='h-2 w-full overflow-hidden rounded-full bg-secondary'>
                <div
                  className='h-full rounded-full bg-primary transition-all duration-300'
                  style={{ width: `${stats.total > 0 ? (stats.assigned / stats.total) * 100 : 0}%` }}
                />
              </div>

              <div className='mt-4 space-y-2'>
                {stats.byCategory.slice(0, 4).map((cat) => {
                  // const Icon = getIcon(cat.icon);
                  return (
                    <div
                      key={cat.id_application_category}
                      className='flex items-center justify-between text-sm'>
                      <div className='flex items-center gap-2'>
                        {/* <Icon className='h-4 w-4 text-muted-foreground' /> */}
                        <span className='text-muted-foreground'>
                          {cat.name}
                        </span>
                      </div>
                      <span className='font-medium text-foreground'>
                        {cat.count}/{cat.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className='mt-4 bg-card border border-border rounded-2xl shadow-sm p-6'>
              <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
                Acciones Rapidas
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

          {/* Main Content - Applications Grid */}
          <div className='lg:col-span-3'>
            {/* Filters */}
            <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              {/* Search */}
              <div className='relative flex-1 sm:max-w-sm'>
                <HiSearch className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground' />
                <input
                  type='text'
                  placeholder='Buscar aplicaciones...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full h-12 rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30'
                />
              </div>

              {/* Filter Mode */}
              <div className='flex items-center gap-2'>
                <HiFilter className='h-5 w-5 text-muted-foreground' />
                <div className='flex rounded-lg border border-border bg-card p-1'>
                  {(["all", "assigned", "unassigned"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFilterMode(mode)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${filterMode === mode
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
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

            {/* Categories */}
            <div className='mb-4 flex flex-wrap gap-2'>
              <button
                onClick={() => setSelectedCategory("all")}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${selectedCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}>
                <HiViewGrid className='h-4 w-4' />
                Todas
              </button>
              {(categories as IApplicationCategory[]).map((category) => {
                // const Icon = getIcon(category.icon);
                return (
                  <button
                    key={category.id_application_category}
                    onClick={() => setSelectedCategory(category.id_application_category ?? "all")}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${selectedCategory === category.id_application_category
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}>
                    {/* <Icon className='h-4 w-4' /> */}
                    {category.name}
                  </button>
                );
              })}
            </div>

            {/* Applications Grid */}
            {loading ? (
              <div className='flex items-center justify-center border-2 border-dashed border-border rounded-2xl p-12 bg-card'>
                <p className='text-sm text-muted-foreground'>Cargando aplicaciones...</p>
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                {filteredCompanyApplications.map((app: any) => {
                  const isAssigned = currentCompanyApplicationIds.includes(app.id_company_application);
                  const category = (categories as IApplicationCategory[]).find(
                    (c) => c.id_application_category === app.application_category_id,
                  );
                  return (
                    <ApplicationCard
                      key={app.id_company_application}
                      app={app}
                      isAssigned={isAssigned}
                      isPending={pendingAppIds.has(app.id_application)}
                      onToggle={() => toggleApp(app)}
                      categoryName={category?.name}
                    />
                  );
                })}
              </div>
            )}

            {!loading && filteredCompanyApplications.length === 0 && (
              <div className='flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-12 bg-card'>
                <HiSearch className='mb-4 h-12 w-12 text-muted-foreground' />
                <p className='text-lg font-medium text-foreground'>
                  No se encontraron aplicaciones
                </p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Intenta ajustar los filtros de busqueda
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplicationCard({
  app,
  isAssigned,
  isPending,
  onToggle,
  categoryName,
}: {
  app: any;
  isAssigned: boolean;
  isPending: boolean;
  onToggle: () => void;
  categoryName?: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md ${isAssigned
        ? "border-primary/50 bg-primary/5"
        : "border-border bg-card hover:border-primary/30"
        }`}>
      <div className='p-6'>
        <div className='flex items-start gap-4'>
          {/* Icon */}
          <div
            className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10'>
            <HiViewGrid className='h-6 w-6 text-primary' />
          </div>

          {/* Content */}
          <div className='min-w-0 flex-1'>
            <h3 className='font-semibold text-foreground'>{app.name}</h3>
            <p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>
              {app.description}
            </p>
          </div>
        </div>

        {/* Toggle Button */}
        <div className='mt-4 flex items-center justify-between'>
          <span className='text-xs text-muted-foreground capitalize'>
            {categoryName || "Sin categoría"}
          </span>
          <button
            onClick={onToggle}
            disabled={isPending}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${isAssigned
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-card border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
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

      {/* Assigned Indicator */}
      {isAssigned && (
        <div className='absolute inset-x-0 bottom-0 h-1 bg-primary' />
      )}
    </div>
  );
}
