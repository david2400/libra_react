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

// Temporary types to allow build
interface IUser {
  id_user?: number;
  id?: number;
  name?: string;
  username?: string;
  avatar?: string;
  department?: string;
  role?: string;
  status?: string;
  company_id?: number;
  assignedApps?: number[];
  client?: { name?: string };
}

interface IApplication {
  id_application: number;
  name: string;
  description?: string;
  application_category_id?: number | null;
  route?: string;
  maintenance_mode?: boolean;
  publication_date?: string;
  deleted?: boolean;
  status?: string;
  color?: string;
  category?: IApplicationCategory;
}

interface IApplicationCategory {
  id_application_category?: number;
  name?: string;
  icon?: string;
}
import { useApplicationData } from "../hooks/use-application-data";
import { IUserApplication } from "../models/user-application.interface";
import { getUsersServerAction } from "@/app/[locale]/(protected)/account/user-companies/actions";
import {
  getUserApplicationsByUserServerAction,
  createUserApplicationServerAction,
  deleteUserApplicationServerAction,
} from "@/app/[locale]/(protected)/security/user-applications/actions";

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

const addOneYear = (date: Date) => {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + 1);
  return next;
};

const toISODate = (date: Date) => date.toISOString().slice(0, 10);

export function UserApplicationsManager() {
  // Data from custom hook
  const {
    applications,
    categories,
    isLoadingApps,
    isLoadingCategories,
    loadApplications,
    loadCategories,
    loadData,
  } = useApplicationData();

  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const result = await getUsersServerAction();
        setUsers(Array.isArray(result) ? (result as IUser[]) : []);
      } catch (error) {
        console.error("Error loading users:", error);
        setUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);
  
  // UI states
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [userApplications, setUserApplications] = useState<Record<number, IUserApplication[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [filterMode, setFilterMode] = useState<"all" | "assigned" | "unassigned">("all");
  const [pendingAppIds, setPendingAppIds] = useState<Set<number>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        console.error("Error cargando aplicaciones del usuario:", error);
      }
    };
    loadUserApplications();
  }, [selectedUser]);

  const currentAssignments = selectedUser?.id_user
    ? (userApplications[selectedUser.id_user] || [])
    : [];
  const currentAppIds = useMemo(
    () => currentAssignments.map((ua) => ua.application_id),
    [currentAssignments]
  );

  const filteredApps = useMemo(() => {
    return (applications as IApplication[]).filter((app) => {
      const matchesSearch =
        app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesCategory =
        selectedCategory === "all" || app.application_category_id === selectedCategory;
      const isAssigned = currentAppIds.includes(app.id_application);
      const matchesFilter =
        filterMode === "all" ||
        (filterMode === "assigned" && isAssigned) ||
        (filterMode === "unassigned" && !isAssigned);
      return matchesSearch && matchesCategory && matchesFilter;
    });
  }, [applications, searchQuery, selectedCategory, currentAppIds, filterMode]);

  const toggleApp = async (app: IApplication) => {
    const userId = selectedUser?.id_user;
    if (!userId) {
      showError("Selecciona un usuario antes de asignar o remover una aplicación");
      return;
    }

    const appId = Number(app.id_application);
    if (!Number.isFinite(appId) || !Number.isFinite(userId)) {
      showError("No se pudo identificar el usuario o la aplicación");
      return;
    }

    const existing = currentAssignments.find((ua) => ua.application_id === appId);

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
        const today = new Date();
        const created = await createUserApplicationServerAction({
          user_id: userId,
          application_id: appId,
          license_start_date: toISODate(today),
          license_end_date: toISODate(addOneYear(today)),
          is_active: true,
          access_level: 'USER',
        });
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

    const missing = (applications as IApplication[])
      .map((app) => ({ app, appId: Number(app.id_application) }))
      .filter(({ appId }) => Number.isFinite(appId) && !currentAppIds.includes(appId));

    missing.forEach(({ appId }) => setPending(appId, true));
    try {
      const today = new Date();
      const created = await Promise.all(
        missing.map(({ appId }) =>
          createUserApplicationServerAction({
            user_id: userId,
            application_id: appId,
            license_start_date: toISODate(today),
            license_end_date: toISODate(addOneYear(today)),
            is_active: true,
            access_level: 'USER',
          })
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

    toRemove.forEach((ua) => setPending(ua.application_id, true));
    try {
      await Promise.all(
        toRemove.map((ua) => deleteUserApplicationServerAction(ua.id_user_application))
      );
      setUserApplications((prev) => ({ ...prev, [userId]: [] }));
    } catch (error: any) {
      showError(error?.message || "No se pudieron remover las aplicaciones");
    } finally {
      toRemove.forEach((ua) => setPending(ua.application_id, false));
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
    const assigned = currentAppIds.length;
    const total = applications.length;
    const byCategory = (categories as IApplicationCategory[])
      .filter((c) => !!c.id_application_category)
      .map((cat) => {
        const catApps = (applications as IApplication[]).filter(
          (app) => app.application_category_id === cat.id_application_category,
        );
        return {
          ...cat,
          count: catApps.filter((app) => currentAppIds.includes(app.id_application)).length,
          total: catApps.length,
        };
      });
    return { assigned, total, byCategory };
  }, [currentAppIds, applications, categories]);

  const getIcon = (iconName?: string) => {
    const IconComponent = iconMap[iconName || ''];
    return IconComponent || HiViewGrid;
  };

  const loading = isLoadingApps || isLoadingCategories || isLoadingUsers;

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='mx-auto max-w-7xl'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-semibold text-foreground'>
                Asignar Aplicaciones
              </h1>
              <p className='mt-1 text-sm text-muted-foreground'>
                Gestiona las aplicaciones asignadas a cada usuario
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || !selectedUser}
                className='flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50'>
                <HiRefresh className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
          {/* Sidebar - User Selection */}
          <div className='lg:col-span-1'>
            {/* User Selector */}
            <div className='rounded-xl border border-border bg-card p-4'>
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
                disabled={isLoadingUsers || users.length === 0}>
                <SelectTrigger className='mt-1 w-full bg-secondary border-border h-12 text-base py-3'>
                  <SelectValue placeholder='Seleccionar usuario...' />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter((user) => user.id_user != null)
                    .map((user) => (
                      <SelectItem
                        key={user.id_user}
                        value={String(user.id_user)}>
                        <span className='flex items-center gap-2'>
                          {user.username} {user.client?.name ? `- ${user.client.name}` : ""}
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
                      <span className='text-muted-foreground'>Email</span>
                      <span className='text-foreground'>
                        {selectedUser?.username || 'N/A'}
                      </span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Departamento</span>
                      <span className='text-foreground'>
                        {selectedUser?.company_id ? `Company ${selectedUser.company_id}` : 'N/A'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className='mt-4 rounded-xl border border-border bg-card p-4'>
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
                  const Icon = getIcon(cat.icon);
                  return (
                    <div
                      key={cat.id_application_category}
                      className='flex items-center justify-between text-sm'>
                      <div className='flex items-center gap-2'>
                        <Icon className='h-4 w-4 text-muted-foreground' />
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
            <div className='mt-4 rounded-xl border border-border bg-card p-4'>
              <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
                Acciones Rapidas
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
                  className='w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
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

            {/* Categories */}
            <div className='mb-4 flex flex-wrap gap-2'>
              <button
                onClick={() => setSelectedCategory("all")}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}>
                <HiViewGrid className='h-4 w-4' />
                Todas
              </button>
              {(categories as IApplicationCategory[]).map((category) => {
                const Icon = getIcon(category.icon);
                return (
                  <button
                    key={category.id_application_category}
                    onClick={() => setSelectedCategory(category.id_application_category ?? "all")}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      selectedCategory === category.id_application_category
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}>
                    <Icon className='h-4 w-4' />
                    {category.name}
                  </button>
                );
              })}
            </div>

            {/* Applications Grid */}
            {loading ? (
              <div className='flex items-center justify-center rounded-xl border border-border bg-card py-16'>
                <p className='text-sm text-muted-foreground'>Cargando aplicaciones...</p>
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                {filteredApps.map((app) => {
                  const isAssigned = currentAppIds.includes(app.id_application);
                  const category = (categories as IApplicationCategory[]).find(
                    (c) => c.id_application_category === app.application_category_id,
                  );
                  return (
                    <ApplicationCard
                      key={app.id_application}
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

            {!loading && filteredApps.length === 0 && (
              <div className='flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16'>
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
  app: IApplication;
  isAssigned: boolean;
  isPending: boolean;
  onToggle: () => void;
  categoryName?: string;
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
          {/* Icon */}
          <div
            className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl'
            style={{ backgroundColor: "#3B82F620" }}>
            <HiViewGrid className='h-6 w-6' />
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
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
              isAssigned
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

      {/* Assigned Indicator */}
      {isAssigned && (
        <div className='absolute inset-x-0 bottom-0 h-1 bg-primary' />
      )}
    </div>
  );
}
