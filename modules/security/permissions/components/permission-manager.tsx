/** @format */

"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import { RegisterPermission, UpdatePermission } from "./form";
import { HiOutlineKey, HiOutlinePlusCircle } from "react-icons/hi2";
import { DataTable } from "@repo/ui/table/scenes";
import {
  IPermission,
  PermissionAction,
  PermissionType,
} from "../models/permission.interface";
import { clientApi } from "@/lib/client-api";
import { Button } from "@repo/ui/buttons/scenes/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/inputs/scenes/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/menu/scenes/dropdown-menu";
import { CgMoreVertical } from "react-icons/cg";
import { FiAlertTriangle, FiEdit2, FiFilter } from "react-icons/fi";
import {
  BiCopy,
  BiPlus,
  BiSave,
  BiSearch,
  BiServer,
  BiShield,
  BiX,
} from "react-icons/bi";
import { BsCpu, BsTrash2 } from "react-icons/bs";
import { LuBuilding2 } from "react-icons/lu";
import { Label } from "@repo/ui/label/scenes/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/tabs/scenes/tabs";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { ICreatePermission } from "@/server/domains/access-control/security/permissions";
import { cn } from "@repo/ui/utils";
import { Input } from "@repo/ui/inputs/scenes/input";
import { CiMonitor } from "react-icons/ci";

// TODO: Fix mock data imports
// import {
//   PERMISSION_ACTIONS,
//   PERMISSION_TYPES,
//   mockApplications,
//   mockModules,
//   mockPermissions,
// } from "../lib/mock-data";

// Temporary mock data to allow build
const PERMISSION_ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE', 'VIEW', 'MANAGE', 'ADMIN', 'APPROVE', 'REJECT'] as const;
const PERMISSION_TYPES = ['API', 'APPLICATION', 'UI', 'SYSTEM'] as const;
const mockApplications: MockApplication[] = [{ id_application: 1, name: 'Admin Portal', route: '/admin', maintenance_mode: false, publication_date: new Date().toISOString(), deleted: false }];
const mockModules: MockModule[] = [{ id: 1, name: 'Users', description: 'User management module', deleted: false }];
const mockPermissions: IPermission[] = [];

// Temporary types for mock data
interface MockModule {
  id: number;
  name: string;
  description: string;
  deleted: boolean;
}

interface MockApplication {
  id_application: number;
  name: string;
  route: string;
  maintenance_mode: boolean;
  publication_date: string;
  deleted: boolean;
}

interface IPermissionManagerProps {
  initialData: IPermission[];
}

const PERMISSION_TYPE_CONFIG: Record<
  PermissionType,
  { icon: typeof BiShield; color: string; bgColor: string }
> = {
  API: {
    icon: BiServer,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  APPLICATION: {
    icon: BsCpu,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/20",
  },
  UI: {
    icon: CiMonitor,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
  },
  SYSTEM: {
    icon: BiShield,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10 border-orange-500/20",
  },
};

const emptyFormData: ICreatePermission = {
  name: "",
  description: "",
  permission_type: "API",
  resource: "",
  action: "READ",
  application_id: 1,
  module_id: undefined,
  api_type: "REST",
  http_method: "GET",
  endpoint_path: "",
  ui_component: "",
  feature_flag: "",
  priority: 50,
  cache_ttl: undefined,
  is_sensitive: false,
  metadata: "",
};

const ACTION_COLORS: Record<PermissionAction, string> = {
  CREATE: "bg-green-500/20 text-green-400 border-green-500/30",
  READ: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  UPDATE: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
  EXECUTE: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  VIEW: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  MANAGE: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  ADMIN: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  APPROVE: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  REJECT: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

export const PermissionManager = ({ initialData }: IPermissionManagerProps) => {
  const t = useTranslations("security.permissions");
  const tActions = useTranslations("actions");

  const [permissions, setPermissions] =
    useState<IPermission[]>(mockPermissions);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");
  const [openModal, setOpenModal] = useState(false);
  const [editingPermission, setEditingPermission] =
    useState<IPermission | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<number>(
    mockApplications[0].id_application,
  );

  // Fetch permissions data client-side
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        const response = await clientApi.get<{
          data: IPermission[];
          meta: any;
        }>("/api/access_control/permissions");
        const permissionsData = response.data;
        // Only update if we got actual data from the API
        if (permissionsData && permissionsData.length > 0) {
          setPermissions(permissionsData);
        }
        // If API returns empty or null, keep the mock data
      } catch (error) {
        console.error("Error fetching permissions:", error);
        // Keep initial data if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const metrics = useMemo(() => {
    const totalPermissions = permissions.length;
    const uniqueApplications = new Set(
      permissions.map((p) => p.application_id).filter(Boolean),
    ).size;

    return {
      totalPermissions,
      activePermissions: totalPermissions, // All permissions are considered active by default
      uniqueApplications,
    };
  }, [permissions]);

  const handleEdit = (row: IPermission) => {
    setEditingPermission(row);
    handleModalCloseEdit();
  };

  const handleModalCloseEdit = () => {
    setOpenModalUpdate((prev) => !prev);
  };

  const handleModalClose = () => {
    setOpenModal((prev) => !prev);
  };

  const [searchQuery, setSearchQuery] = useState("");
 
  const [filterType, setFilterType] = useState<PermissionType | "ALL">("ALL");
  const [filterAction, setFilterAction] = useState<PermissionAction | "ALL">(
    "ALL",
  );
  const [activeModuleTab, setActiveModuleTab] = useState<string>(
    String(mockModules[0].id),
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ICreatePermission>({
    ...emptyFormData,
    application_id: selectedApplication,
  });
  const [deletePermission, setDeletePermission] = useState<IPermission | null>(
    null,
  );
  const [hasChanges, setHasChanges] = useState(false);

  // Filter permissions by application first
  const applicationPermissions = useMemo(() => {
    const filtered = permissions.filter((p) => p.application_id === selectedApplication);
    console.log('🔍 Filter Debug:', {
      totalPermissions: permissions.length,
      selectedApplication,
      filteredCount: filtered.length,
      samplePermission: permissions[0]
    });
    return filtered;
  }, [permissions, selectedApplication]);

  // Group permissions by module for the selected application
  const groupedByModule = useMemo(() => {
    const grouped = new Map<
      number,
      { module: (typeof mockModules)[0]; permissions: IPermission[] }
    >();

    applicationPermissions.forEach((p) => {
      const moduleId = p.module_id || 0;
      const module = mockModules.find((m) => m.id === moduleId) || {
        id: -1,
        name: "Sin Modulo",
        description: "",
        deleted: false,
      };

      if (!grouped.has(moduleId)) {
        grouped.set(moduleId, { module, permissions: [] });
      }
      grouped.get(moduleId)!.permissions.push(p);
    });

    return Array.from(grouped.values()).sort((a, b) =>
      a.module.name.localeCompare(b.module.name),
    );
  }, [applicationPermissions]);

  // Get modules that have permissions for this application
  const availableModules = useMemo(() => {
    return groupedByModule.map((g) => g.module);
  }, [groupedByModule]);

  // Auto-select first module when available modules change
  useEffect(() => {
    if (availableModules.length > 0) {
      const currentModuleExists = availableModules.some(
        (m) => String(m.id) === activeModuleTab
      );
      if (!currentModuleExists) {
        setActiveModuleTab(String(availableModules[0].id));
      }
    }
  }, [availableModules, activeModuleTab]);

  // Filter permissions for the active module tab
  const filteredPermissions = useMemo(() => {
    const moduleId = parseInt(activeModuleTab);
    const moduleGroup = groupedByModule.find((g) => Number(g.module.id) === moduleId);
    if (!moduleGroup) return [];

    return moduleGroup.permissions.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.resource.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        filterType === "ALL" || p.permission_type === filterType;
      const matchesAction = filterAction === "ALL" || p.action === filterAction;
      const matchesStatus =
        filterStatus === "ALL" ||
        (filterStatus === "ACTIVE" && p.deleted) ||
        (filterStatus === "INACTIVE" && !p.deleted);
      return matchesSearch && matchesType && matchesAction && matchesStatus;
    });
  }, [
    groupedByModule,
    activeModuleTab,
    searchQuery,
    filterType,
    filterAction,
    filterStatus,
  ]);

  // Count permissions per module for badges
  const modulePermissionCounts = useMemo(() => {
    const counts = new Map<number, number>();
    groupedByModule.forEach((g) => {
      counts.set(Number(g.module.id), g.permissions.length);
    });
    return counts;
  }, [groupedByModule]);

  const totalFiltered = filteredPermissions.length;
  const totalApplication = applicationPermissions.length;

  const handleCreate = () => {
    setEditingPermission(null);
    setFormData({
      ...emptyFormData,
      application_id: selectedApplication,
      module_id: parseInt(activeModuleTab) || undefined,
    });
    setIsDialogOpen(true);
  };

  // const handleEdit = (permission: IPermission) => {
  //   setEditingPermission(permission);
  //   setFormData({
  //     name: permission.name,
  //     description: permission.description || "",
  //     permission_type: permission.permission_type,
  //     resource: permission.resource,
  //     action: permission.action,
  //     application_id: permission.application_id,
  //     module_id: permission.module_id,
  //     api_type: permission.api_type,
  //     http_method: permission.http_method,
  //     endpoint_path: permission.endpoint_path,
  //     ui_component: permission.ui_component,
  //     feature_flag: permission.feature_flag,
  //     priority: permission.priority,
  //     cache_ttl: permission.cache_ttl,
  //     is_sensitive: permission.is_sensitive || false,
  //     metadata: permission.metadata,
  //   });
  //   setIsDialogOpen(true);
  // };

  const handleDuplicate = (permission: IPermission) => {
    setEditingPermission(null);
    setFormData({
      ...permission,
      name: `${permission.name}_COPY`,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (permission: IPermission) => {
    setDeletePermission(permission);
  };

  const confirmDelete = () => {
    if (!deletePermission) return;
    setPermissions((prev) =>
      prev.filter((p) => p.id_permission !== deletePermission.id_permission),
    );
    setDeletePermission(null);
    setHasChanges(true);
  };

  const handleToggleActive = (permission: IPermission) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.id_permission === permission.id_permission
          ? { ...p, is_active: !p.deleted }
          : p,
      ),
    );
    setHasChanges(true);
  };

  const handleSavePermission = () => {
    if (!formData.name.trim() || !formData.resource.trim()) return;

    if (editingPermission) {
      setPermissions((prev) =>
        prev.map((p) =>
          p.id_permission === editingPermission.id_permission
            ? { ...p, ...formData }
            : p,
        ),
      );
    } else {
      const newPermission: IPermission = {
        ...formData,
        id_permission: Date.now(),
        created_at: new Date(),
        deleted: false,
      };
      setPermissions((prev) => [...prev, newPermission]);
    }

    setIsDialogOpen(false);
    setEditingPermission(null);
    setFormData({ ...emptyFormData, application_id: selectedApplication });
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log("Saving permissions:", permissions);
    setHasChanges(false);
  };

  const handleApplicationChange = (appId: string) => {
    const newAppId = parseInt(appId);
    setSelectedApplication(newAppId);
    // Reset to first module of new application
    const firstModule = groupedByModule[0]?.module;
    if (firstModule) {
      setActiveModuleTab(String(firstModule.id));
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("ALL");
    setFilterAction("ALL");
    setFilterStatus("ALL");
  };

  const hasActiveFilters =
    searchQuery ||
    filterType !== "ALL" ||
    filterAction !== "ALL" ||
    filterStatus !== "ALL";

  return (
    <section className='mx-auto flex w-full flex-col gap-6 px-6'>
      <div className='flex flex-col gap-6'>
        {/* Header */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-semibold text-foreground'>
              Permissions
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Manage individual permissions with types: API, APPLICATION, UI,
              SYSTEM
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={handleModalClose}>
              <BiPlus className='mr-2 h-4 w-4' />
              New Permission
            </Button>
            <Button
              size='sm'
              onClick={handleSave}
              disabled={!hasChanges}
              className='bg-primary text-primary-foreground hover:bg-primary/90'>
              <BiSave className='mr-2 h-4 w-4' />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Application Selector */}
        <div className='flex flex-col gap-4 rounded-lg border border-border bg-card p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20'>
              <LuBuilding2 className='h-5 w-5 text-primary' />
            </div>
            <div className='flex-1'>
              <Label className='text-sm text-muted-foreground'>
                Application
              </Label>
              <Select
                value={String(selectedApplication)}
                onValueChange={handleApplicationChange}>
                <SelectTrigger className='mt-1 w-full max-w-xs bg-secondary border-border'>
                  <SelectValue placeholder='Select application' />
                </SelectTrigger>
                <SelectContent>
                  {mockApplications.map((app) => (
                    <SelectItem
                      key={app.id_application}
                      value={String(app.id_application)}>
                      <span className='flex items-center gap-2'>
                        {app.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='text-right'>
              <p className='text-2xl font-bold text-foreground'>
                {totalApplication}
              </p>
              <p className='text-xs text-muted-foreground'>Total Permissions</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center'>
            <div className='relative flex-1 max-w-md'>
              <BiSearch className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search permissions...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9 bg-secondary border-border'
              />
            </div>

            <div className='flex flex-wrap items-center gap-2'>
              <Select
                value={filterType}
                onValueChange={(v) =>
                  setFilterType(v as PermissionType | "ALL")
                }>
                <SelectTrigger className='w-36 bg-secondary border-border'>
                  <FiFilter className='mr-2 h-4 w-4' />
                  <SelectValue placeholder='Type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>All Types</SelectItem>
                  {PERMISSION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filterAction}
                onValueChange={(v) =>
                  setFilterAction(v as PermissionAction | "ALL")
                }>
                <SelectTrigger className='w-36 bg-secondary border-border'>
                  <SelectValue placeholder='Action' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>All Actions</SelectItem>
                  {PERMISSION_ACTIONS.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filterStatus}
                onValueChange={(v) =>
                  setFilterStatus(v as "ALL" | "ACTIVE" | "INACTIVE")
                }>
                <SelectTrigger className='w-32 bg-secondary border-border'>
                  <SelectValue placeholder='Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>All</SelectItem>
                  <SelectItem value='ACTIVE'>Active</SelectItem>
                  <SelectItem value='INACTIVE'>Inactive</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant='ghost' size='sm' onClick={clearFilters}>
                  <BiX className='mr-1 h-4 w-4' />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
            <span>{totalFiltered} permissions shown</span>
            <span className='text-border'>|</span>
            <span>{availableModules.length} modules</span>
          </div>
        </div>

        {/* Permission Type Legend */}
        <div className='flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4'>
          <span className='text-sm font-medium text-foreground'>Types:</span>
          {PERMISSION_TYPES.map((type) => {
            const config = PERMISSION_TYPE_CONFIG[type as PermissionType];
            const Icon = config.icon;
            return (
              <div
                key={type}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-1.5",
                  config.bgColor,
                )}>
                <Icon className={cn("h-4 w-4", config.color)} />
                <span className={cn("text-sm font-medium", config.color)}>
                  {type}
                </span>
              </div>
            );
          })}
        </div>

        {/* Module Tabs with Permissions */}
        {availableModules.length > 0 ? (
          <Tabs
            value={activeModuleTab}
            onValueChange={setActiveModuleTab}
            className='w-full'>
            <TabsList className='flex flex-wrap h-auto gap-1 bg-secondary p-1'>
              {availableModules.map((module) => (
                <TabsTrigger
                  key={module.id}
                  value={String(module.id)}
                  className='flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'>
                  {module.name}
                  <Badge
                    variant='secondary'
                    className='ml-1 h-5 min-w-5 px-1.5 text-xs'>
                    {modulePermissionCounts.get(Number(module.id)) || 0}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {availableModules.map((module) => (
              <TabsContent
                key={module.id}
                value={String(module.id)}
                className='mt-4'>
                <div className='rounded-lg border border-border bg-card overflow-hidden'>
                  {/* Module Header */}
                  <div className='flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-3'>
                    <div>
                      <h3 className='font-medium text-foreground'>
                        {module.name}
                      </h3>
                      <p className='text-sm text-muted-foreground'>
                        {module.description}
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      {PERMISSION_TYPES.map((type) => {
                        const count = filteredPermissions.filter(
                          (p) => p.permission_type === type,
                        ).length;
                        if (count === 0) return null;
                        const config =
                          PERMISSION_TYPE_CONFIG[type as PermissionType];
                        return (
                          <Badge
                            key={type}
                            variant='outline'
                            className={config.bgColor}>
                            {type}: {count}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Permissions List */}
                  <div className='divide-y divide-border'>
                    {filteredPermissions.length > 0 ? (
                      filteredPermissions.map((permission) => {
                        const typeConfig =
                          PERMISSION_TYPE_CONFIG[
                            permission.permission_type as PermissionType
                          ];
                        const TypeIcon = typeConfig.icon;

                        return (
                          <div
                            key={permission.id_permission}
                            className={cn(
                              "flex items-center justify-between p-4 transition-colors hover:bg-secondary/30",
                              permission.deleted && "opacity-50",
                            )}>
                            <div className='flex items-center gap-4 flex-1 min-w-0'>
                              <div
                                className={cn(
                                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                                  typeConfig.bgColor,
                                )}>
                                <TypeIcon
                                  className={cn("h-5 w-5", typeConfig.color)}
                                />
                              </div>

                              <div className='flex-1 min-w-0'>
                                <div className='flex items-center gap-2 flex-wrap'>
                                  <span className='font-medium text-foreground truncate'>
                                    {permission.name}
                                  </span>
                                  <Badge
                                    variant='outline'
                                    className={
                                      ACTION_COLORS[permission.action]
                                    }>
                                    {permission.action}
                                  </Badge>
                                  {permission.is_sensitive && (
                                    <Badge
                                      variant='outline'
                                      className='bg-red-500/10 text-red-400 border-red-500/20'>
                                      <FiAlertTriangle className='mr-1 h-3 w-3' />
                                      Sensitive
                                    </Badge>
                                  )}
                                </div>
                                <p className='text-sm text-muted-foreground truncate mt-0.5'>
                                  {permission.description ||
                                    `Resource: ${permission.resource}`}
                                </p>
                                {permission.permission_type === "API" &&
                                  permission.endpoint_path && (
                                    <code className='text-xs text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded mt-1 inline-block'>
                                      {permission.http_method}{" "}
                                      {permission.endpoint_path}
                                    </code>
                                  )}
                              </div>
                            </div>

                            <div className='flex items-center gap-3'>
                              {/* <Switch
                                checked={permission.is_active}
                                onCheckedChange={() =>
                                  handleToggleActive(permission)
                                }
                              /> */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-8 w-8'>
                                    <CgMoreVertical className='h-4 w-4' />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(permission)}>
                                    <FiEdit2 className='mr-2 h-4 w-4' />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDuplicate(permission)}>
                                    <BiCopy className='mr-2 h-4 w-4' />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(permission)}
                                    className='text-destructive focus:text-destructive'>
                                    <BsTrash2 className='mr-2 h-4 w-4' />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className='flex flex-col items-center justify-center py-12 text-center'>
                        <BiShield className='h-12 w-12 text-muted-foreground/50 mb-3' />
                        <p className='text-muted-foreground'>
                          No permissions found matching your filters
                        </p>
                        {hasActiveFilters && (
                          <Button
                            variant='link'
                            size='sm'
                            onClick={clearFilters}
                            className='mt-2'>
                            Clear filters
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className='flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border bg-card'>
            <BiShield className='h-12 w-12 text-muted-foreground/50 mb-3' />
            <p className='text-muted-foreground'>
              No permissions for this application
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={handleModalClose}
              className='mt-4'>
              <BiPlus className='mr-2 h-4 w-4' />
              Create First Permission
            </Button>
          </div>
        )}
      </div>
      <Modal
        size='lg'
        title={editingPermission ? "Editar permiso" : "Crear permiso"}
        open={openModal}
        onOpenChange={handleModalClose}>
        <RegisterPermission />
      </Modal>

      <Modal
        size='lg'
        open={openModalUpdate}
        onOpenChange={handleModalCloseEdit}
        title={t("modal.edit_title")}
        description={t("modal.edit_description")}
        showCloseButton={true}
        hideDefaultFooter={true}>
        <UpdatePermission
          initialValues={editingPermission}
          handleClose={handleModalCloseEdit}
        />
      </Modal>
    </section>
  );
};
