/** @format */

"use client";

import { useMemo, useState, useEffect } from "react";
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
  HiPlus,
  HiMinus,
  HiRefresh,
  HiFilter,
} from "react-icons/hi";
import Swal from "sweetalert2";
import { ICompany } from "@/server/domains/access-control/account/companies";
import { getAllCompaniesServerAction } from "@/app/[locale]/(protected)/account/companies/actions";
import {
  createCompanyApplicationServerAction,
  deleteCompanyApplicationServerAction,
  getCompanyApplicationsServerAction,
} from "@/app/[locale]/(protected)/security/company-applications/actions";
import { ICompanyApplication } from "../models/company-application.interface";
import { useApplicationData } from "../hooks/use-application-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/inputs/scenes/select";

interface IApplication {
  id_application: number;
  name: string;
  description?: string;
  application_category_id?: number | null;
}

interface IApplicationCategory {
  id_application_category?: number;
  name?: string;
  icon?: string;
}

interface ICompanyApplicationManagerProps {
  initialData: ICompanyApplication[];
}

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

export const CompanyApplicationManager = ({
  initialData,
}: ICompanyApplicationManagerProps) => {
  // Applications + categories from shared hook
  const {
    applications,
    categories,
    isLoadingApps,
    isLoadingCategories,
  } = useApplicationData();

  // Companies
  const [companiesData, setCompaniesData] = useState<{
    data: ICompany[];
    loading: boolean;
    error: string | null;
  }>({
    data: [],
    loading: false,
    error: null,
  });

  const cargarCompanies = async () => {
    try {
      setCompaniesData((prev) => ({ ...prev, loading: true, error: null }));
      const companies = await getAllCompaniesServerAction();
      setCompaniesData({
        data: companies,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error cargando companies:", error);
      setCompaniesData({
        data: [],
        loading: false,
        error: "No se pudieron cargar las empresas",
      });
    }
  };

  useEffect(() => {
    cargarCompanies();
  }, []);

  // Company <-> Application assignments (real backend records)
  const [companyApplications, setCompanyApplications] =
    useState<ICompanyApplication[]>(initialData);
  const [selectedCompany, setSelectedCompany] = useState<ICompany | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [filterMode, setFilterMode] = useState<"all" | "assigned" | "unassigned">("all");
  const [pendingAppIds, setPendingAppIds] = useState<Set<number>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const setPending = (appId: number, pending: boolean) => {
    setPendingAppIds((prev) => {
      const next = new Set(prev);
      if (pending) {
        next.add(appId);
      } else {
        next.delete(appId);
      }
      return next;
    });
  };

  const currentAssignments = useMemo(() => {
    if (!selectedCompany) return [];
    return companyApplications.filter(
      (ca) => ca.company_id === selectedCompany.id_company,
    );
  }, [companyApplications, selectedCompany]);

  const currentAppIds = useMemo(
    () => currentAssignments.map((ca) => ca.application_id),
    [currentAssignments],
  );

  const filteredApps = useMemo(() => {
    return (applications as IApplication[]).filter((app) => {
      const matchesSearch =
        app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesCategory =
        selectedCategory === "all" ||
        app.application_category_id === selectedCategory;
      const isAssigned = currentAppIds.includes(app.id_application);
      const matchesFilter =
        filterMode === "all" ||
        (filterMode === "assigned" && isAssigned) ||
        (filterMode === "unassigned" && !isAssigned);
      return matchesSearch && matchesCategory && matchesFilter;
    });
  }, [applications, searchQuery, selectedCategory, currentAppIds, filterMode]);

  const showError = (message: string) => {
    Swal.fire({ title: "Error!", text: message, icon: "error" });
  };

  const toggleApp = async (app: IApplication) => {
    if (!selectedCompany) {
      showError("Selecciona una empresa antes de asignar o remover una aplicación");
      return;
    }

    const appId = Number(app.id_application);
    const companyId = Number(selectedCompany.id_company);
    if (!Number.isFinite(appId) || !Number.isFinite(companyId)) {
      showError("No se pudo identificar la empresa o la aplicación");
      return;
    }

    const existing = companyApplications.find(
      (ca) => ca.company_id === companyId && ca.application_id === appId,
    );

    setPending(appId, true);
    try {
      if (existing) {
        await deleteCompanyApplicationServerAction(existing.id_company_application);
        setCompanyApplications((prev) =>
          prev.filter((ca) => ca.id_company_application !== existing.id_company_application),
        );
      } else {
        const today = new Date();
        const created = await createCompanyApplicationServerAction({
          company_id: companyId,
          application_id: appId,
          license_start_date: toISODate(today),
          license_end_date: toISODate(addOneYear(today)),
          is_active: true,
        });
        if (created) {
          setCompanyApplications((prev) => [...prev, created as ICompanyApplication]);
        }
      }
    } catch (error: any) {
      showError(error?.message || "No se pudo actualizar la asignación");
    } finally {
      setPending(appId, false);
    }
  };

  const assignAll = async () => {
    if (!selectedCompany) return;
    const companyId = Number(selectedCompany.id_company);
    if (!Number.isFinite(companyId)) {
      showError("No se pudo identificar la empresa");
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
          createCompanyApplicationServerAction({
            company_id: companyId,
            application_id: appId,
            license_start_date: toISODate(today),
            license_end_date: toISODate(addOneYear(today)),
            is_active: true,
          }),
        ),
      );
      setCompanyApplications((prev) => [
        ...prev,
        ...created.filter(Boolean).map((c) => c as ICompanyApplication),
      ]);
    } catch (error: any) {
      showError(error?.message || "No se pudieron asignar todas las aplicaciones");
    } finally {
      missing.forEach(({ appId }) => setPending(appId, false));
    }
  };

  const removeAll = async () => {
    if (!selectedCompany) return;
    const toRemove = [...currentAssignments];

    toRemove.forEach((ca) => setPending(ca.application_id, true));
    try {
      await Promise.all(
        toRemove.map((ca) => deleteCompanyApplicationServerAction(ca.id_company_application)),
      );
      const removedIds = new Set(toRemove.map((ca) => ca.id_company_application));
      setCompanyApplications((prev) =>
        prev.filter((ca) => !removedIds.has(ca.id_company_application)),
      );
    } catch (error: any) {
      showError(error?.message || "No se pudieron remover todas las aplicaciones");
    } finally {
      toRemove.forEach((ca) => setPending(ca.application_id, false));
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await getCompanyApplicationsServerAction();
      setCompanyApplications(data);
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
    if (!iconName) return HiViewGrid;
    return iconMap[iconName] || HiViewGrid;
  };

  const loading = isLoadingApps || isLoadingCategories || companiesData.loading;

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
                Gestiona las aplicaciones asignadas a cada empresa
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className='flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50'>
                <HiRefresh className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
          {/* Sidebar - Company Selection */}
          <div className='lg:col-span-1'>
            {/* Company Selector */}
            <div className='rounded-xl border border-border bg-card p-4'>
              <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
                Empresa Seleccionada
              </h3>
              <Select
                value={selectedCompany ? String(selectedCompany.id_company) : ""}
                onValueChange={(value) => {
                  const id = Number(value);
                  const company =
                    companiesData.data.find((c) => c.id_company === id) || null;
                  setSelectedCompany(company);
                }}
                disabled={companiesData.loading || companiesData.data.length === 0}>
                <SelectTrigger className='mt-1 w-full bg-secondary border-border h-12 text-base py-3'>
                  <SelectValue placeholder='Seleccionar empresa...' />
                </SelectTrigger>
                <SelectContent>
                  {companiesData.data.map((company) => (
                    <SelectItem
                      key={company.id_company}
                      value={String(company.id_company)}>
                      <span className='flex items-center gap-2'>
                        {company.name} {company.nit ? `- ${company.nit}` : ""}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Company Info */}
              <div className='mt-4 space-y-2 border-t border-border pt-4'>
                {selectedCompany && (
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>NIT</span>
                    <span className='text-foreground'>
                      {selectedCompany.nit || "N/A"}
                    </span>
                  </div>
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
                  style={{
                    width: `${stats.total > 0 ? (stats.assigned / stats.total) * 100 : 0}%`,
                  }}
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
                Acciones Rápidas
              </h3>
              <div className='space-y-2'>
                <button
                  onClick={assignAll}
                  disabled={!selectedCompany}
                  className='flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50'>
                  <HiPlus className='h-4 w-4' />
                  Asignar Todas
                </button>
                <button
                  onClick={removeAll}
                  disabled={!selectedCompany}
                  className='flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-50'>
                  <HiMinus className='h-4 w-4' />
                  Remover Todas
                </button>
              </div>
            </div>
          </div>

          {/* Main Content - Applications Grid */}
          <div className='lg:col-span-3'>
            {!selectedCompany ? (
              <div className='flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16'>
                <HiUserGroup className='mb-4 h-12 w-12 text-muted-foreground' />
                <p className='text-lg font-medium text-foreground'>
                  Selecciona una empresa
                </p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Elige una empresa para gestionar sus aplicaciones asignadas
                </p>
              </div>
            ) : (
              <>
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
                        onClick={() =>
                          setSelectedCategory(category.id_application_category ?? "all")
                        }
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
                      Intenta ajustar los filtros de búsqueda
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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
