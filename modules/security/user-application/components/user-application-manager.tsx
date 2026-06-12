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
  HiChevronDown,
  HiSave,
  HiRefresh,
  HiFilter,
  HiSwitchHorizontal,
} from "react-icons/hi";
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
}

interface IApplication {
  id_application: number;
  name: string;
  description?: string;
  route?: string;
  maintenance_mode?: boolean;
  publication_date?: string;
  deleted?: boolean;
  status?: string;
  color?: string;
  category?: IApplicationCategory;
}

interface IApplicationCategory {
  id?: number;
  name?: string;
}
import { useApplicationData } from "../hooks/use-application-data";

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
    loadApplications,
    loadCategories,
    loadData,
  } = useApplicationData();

  const [users] = useState<IUser[]>([]); // TODO: Load from users API
  
  // UI states
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [userAssignments, setUserAssignments] = useState<Record<number, number[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hasChanges, setHasChanges] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "assigned" | "unassigned">("all");

  const currentAssignments = selectedUser?.id_user ? (userAssignments[selectedUser.id_user] || []) : [];

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      // TODO: Add category support when backend provides it
      const matchesCategory = selectedCategory === "all";
      const isAssigned = currentAssignments.includes(app.id_application);
      const matchesFilter =
        filterMode === "all" ||
        (filterMode === "assigned" && isAssigned) ||
        (filterMode === "unassigned" && !isAssigned);
      return matchesSearch && matchesCategory && matchesFilter;
    });
  }, [searchQuery, selectedCategory, currentAssignments, filterMode, applications]);

  const toggleApp = (appId: string) => {
    const userId = selectedUser?.id_user;
    if (!userId) return;
    
    setUserAssignments((prev) => {
      const userApps = prev[userId] || [];
      const appIdNum = Number(appId);
      const newApps = userApps.includes(appIdNum)
        ? userApps.filter((id: number) => id !== appIdNum)
        : [...userApps, appIdNum];
      return { ...prev, [userId]: newApps };
    });
    setHasChanges(true);
  };

  const assignAll = () => {
    const userId = selectedUser?.id_user;
    if (!userId) return;
    
    setUserAssignments((prev) => ({
      ...prev,
      [userId]: applications.map((app) => app.id_application),
    }));
    setHasChanges(true);
  };

  const removeAll = () => {
    const userId = selectedUser?.id_user;
    if (!userId) return;
    
    setUserAssignments((prev) => ({
      ...prev,
      [userId]: [],
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
  };

  const handleReset = () => {
    setUserAssignments(
      users.reduce(
        (acc, user) => {
          if (user.id_user) {
            return { ...acc, [user.id_user]: user.assignedApps || [] };
          }
          return acc;
        },
        {} as Record<number, number[]>,
      ),
    );
    setHasChanges(false);
  };

  const stats = useMemo(() => {
    const assigned = currentAssignments.length;
    const total = applications.length;
    const byCategory = categories
      .filter((c) => c.id !== "all")
      .map((cat) => ({
        ...cat,
        count: applications.filter(
          (app) =>
            app.category === cat.id && currentAssignments.includes(app.id_application),
        ).length,
        total: applications.filter((app) => app.category === cat.id).length,
      }));
    return { assigned, total, byCategory };
  }, [currentAssignments]);

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent || HiViewGrid;
  };

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
          {/* Sidebar - User Selection */}
          <div className='lg:col-span-1'>
            {/* User Selector */}
            <div className='rounded-xl border border-border bg-card p-4'>
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
                      {selectedUser ? selectedUser.username || 'Select User' : 'Select User'}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {selectedUser?.status || 'No status'}
                    </p>
                  </div>
                  <HiChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${showUserDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showUserDropdown && (
                  <div className='absolute left-0 right-0 top-full z-10 mt-2 rounded-lg border border-border bg-card shadow-xl'>
                    <div className='max-h-64 overflow-y-auto p-2'>
                      {users.map((user) => (
                        <button
                          key={user.id}
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
                            {user.avatar}
                          </div>
                          <div className='flex-1 text-left'>
                            <p className='font-medium text-foreground'>
                              {user.name}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {user.department} - {user.role}
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
                  style={{ width: `${(stats.assigned / stats.total) * 100}%` }}
                />
              </div>

              <div className='mt-4 space-y-2'>
                {stats.byCategory.slice(0, 4).map((cat) => {
                  const Icon = getIcon(cat.icon);
                  return (
                    <div
                      key={cat.id}
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
                  className='flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20'>
                  <HiPlus className='h-4 w-4' />
                  Asignar Todas
                </button>
                <button
                  onClick={removeAll}
                  className='flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20'>
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
              {categories.map((category) => {
                const Icon = getIcon(category.icon);
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      selectedCategory === category.id
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
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
              {filteredApps.map((app) => {
                const isAssigned = currentAssignments.includes(app.id_application);
                const Icon = getIcon(app.icon);
                return (
                  <ApplicationCard
                    key={app.id_application}
                    app={app}
                    isAssigned={isAssigned}
                    onToggle={() => toggleApp(app.id_application)}
                    Icon={Icon}
                    categories={categories}
                  />
                );
              })}
            </div>

            {filteredApps.length === 0 && (
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
  onToggle,
  Icon,
  categories,
}: {
  app: IApplication;
  isAssigned: boolean;
  onToggle: () => void;
  Icon: React.ComponentType<{ className?: string }>;
  categories: IApplicationCategory[];
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all duration-200 ${
        isAssigned
          ? "border-primary/50 bg-primary/5"
          : "border-border bg-card hover:border-primary/30"
      }`}>
      {/* Status Badge */}
      {app.status !== "active" && (
        <div className='absolute right-3 top-3'>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              app.status === "beta"
                ? "bg-warning/20 text-warning"
                : "bg-muted text-muted-foreground"
            }`}>
            {app.status === "beta" ? "Beta" : "Deprecated"}
          </span>
        </div>
      )}

      <div className='p-4'>
        <div className='flex items-start gap-4'>
          {/* Icon */}
          <div
            className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl'
            style={{ backgroundColor: `${app.color}20` }}>
            <Icon className='h-6 w-6' />
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
            {categories.find((c) => c.id === app.category)?.name}
          </span>
          <button
            onClick={onToggle}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
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

      {/* Assigned Indicator */}
      {isAssigned && (
        <div className='absolute inset-x-0 bottom-0 h-1 bg-primary' />
      )}
    </div>
  );
}
