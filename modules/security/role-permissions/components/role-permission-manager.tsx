"use client";

import { useState, useMemo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  RiShieldUserLine,
  RiCheckboxCircleFill,
  RiCheckboxBlankCircleLine,
  RiRefreshLine,
  RiCloseLine,
  RiCheckDoubleLine,
  RiAppsLine,
  RiGlobalLine,
  RiDatabase2Line,
  RiKeyLine,
  RiLockLine,
} from "react-icons/ri";
import { DataTable } from "@repo/ui/table/scenes";
import type {
  IPermission,
  PermissionTarget,
} from "../models/menu-permission.interface";
import { SearchableSelect } from "@repo/ui/inputs/scenes/select";
import type { IApplication } from "@/server/domains/access-control/security/applications";
import type { IRole } from "@/server/domains/access-control/security/roles";
import {
  listApplicationsAction,
  listRolesByApplicationAction,
  listPermissionsByApplicationAction,
  listPermissionsByRoleAction,
  createRolePermissionAction,
  deleteRolePermissionAction,
} from "../actions/role.actions";
import {
  listPermissionsByUserAction,
  createUserPermissionAction,
  deleteUserPermissionAction,
} from "../actions/user.actions";
import { UserSearchableSelect } from "./user-searchable-select";

const DEFAULT_LEVEL = "read";

interface PermissionCheckboxProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function PermissionCheckbox({ checked, onChange, disabled }: PermissionCheckboxProps) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`w-5 h-5 flex items-center justify-center rounded transition-all duration-200 ${disabled
        ? "opacity-50 cursor-not-allowed"
        : "cursor-pointer hover:scale-110"
        } ${checked ? "text-primary" : "text-muted-foreground"}`}>
      {checked ? (
        <RiCheckboxCircleFill className='w-5 h-5' />
      ) : (
        <RiCheckboxBlankCircleLine className='w-5 h-5' />
      )}
    </button>
  );
}

// Local working state for a single catalog permission against the selected target.
interface PermissionRowState {
  assigned: boolean;
  level: string;
}

function matchesPermissionTarget(
  p: any,
  target: PermissionTarget | null,
): boolean {
  if (!target) return false;
  return target.type === 'role'
    ? p.role_id === target.id
    : p.user_id === target.id;
}

export function RolePermissionManager() {
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<number | null>(
    null,
  );
  const [roles, setRoles] = useState<IRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [permissionsCatalog, setPermissionsCatalog] = useState<IPermission[]>([]);
  const [rowStates, setRowStates] = useState<Record<number, PermissionRowState>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);

  const selectedRoleData = roles.find((r) => r.id_role === selectedRole);

  const selectedTarget = useMemo<PermissionTarget | null>(
    () =>
      selectedRole
        ? { type: "role" as const, id: selectedRole }
        : selectedUser
          ? { type: "user" as const, id: selectedUser }
          : null,
    [selectedRole, selectedUser],
  );

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setIsLoadingApps(true);
      const apps = await listApplicationsAction();
      setApplications(Array.isArray(apps) ? apps : []);
    } catch (error) {
      console.error("Error loading applications:", error);
      setApplications([]);
    } finally {
      setIsLoadingApps(false);
    }
  };

  const loadRolesAndCatalog = async (applicationId: number) => {
    try {
      setIsLoadingRoles(true);
      setIsLoadingCatalog(true);

      const [rolesData, catalogData] = await Promise.all([
        listRolesByApplicationAction({ application_id: applicationId }),
        listPermissionsByApplicationAction(applicationId),
      ]);

      const validRoles = Array.isArray(rolesData) ? rolesData : [];
      const validCatalog = Array.isArray(catalogData) ? catalogData : [];

      setRoles(validRoles);
      setPermissionsCatalog(validCatalog);

      if (validRoles.length > 0) {
        setSelectedRole(validRoles[0].id_role);
      } else {
        setSelectedRole(null);
      }
      setSelectedUser(null);
    } catch (error) {
      console.error("Error loading roles and permissions catalog:", error);
      setRoles([]);
      setPermissionsCatalog([]);
      setRowStates({});
      setSelectedRole(null);
      setSelectedUser(null);
    } finally {
      setIsLoadingRoles(false);
      setIsLoadingCatalog(false);
    }
  };

  const buildRowStates = (assignments: any[]): Record<number, PermissionRowState> => {
    const map: Record<number, PermissionRowState> = {};
    assignments.forEach((a) => {
      const permissionId = Number(a.permission_id ?? a.permissionId);
      map[permissionId] = {
        assigned: true,
        level: a.level ?? DEFAULT_LEVEL,
      };
    });
    return map;
  };

  const handleApplicationChange = (appId: number) => {
    setSelectedApplication(appId);
    loadRolesAndCatalog(appId);
  };

  const handleRoleChange = async (roleId: number) => {
    setSelectedRole(roleId);
    setSelectedUser(null);
    setSaveError(null);

    if (!roleId) {
      setRowStates({});
      return;
    }

    try {
      setIsLoadingAssignments(true);
      const result = await listPermissionsByRoleAction(roleId);

      if (result.success) {
        setRowStates(buildRowStates(result.data ?? []));
      } else {
        console.error('Error loading role permissions:', result.error);
        setRowStates({});
      }
    } catch (error) {
      console.error('Error loading role permissions:', error);
      setRowStates({});
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  const handleUserChange = async (userId: number) => {
    setSelectedUser(userId);
    setSelectedRole(null);
    setSaveError(null);

    if (!userId) {
      setRowStates({});
      return;
    }

    try {
      setIsLoadingAssignments(true);
      const result = await listPermissionsByUserAction(userId);

      if (result.success) {
        setRowStates(buildRowStates(result.data ?? []));
      } else {
        console.error('Error loading user permissions:', result.error);
        setRowStates({});
      }
    } catch (error) {
      console.error('Error loading user permissions:', error);
      setRowStates({});
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  const handleToggle = async (permissionId: number) => {
    if (!selectedTarget || loadingIds.has(permissionId) || isBulkUpdating) return;

    const current = rowStates[permissionId] ?? { assigned: false, level: DEFAULT_LEVEL };
    const next = { ...current, assigned: !current.assigned };

    setLoadingIds((prev) => new Set(prev).add(permissionId));
    setSaveError(null);

    try {
      let result;
      if (next.assigned) {
        result = selectedTarget.type === "role"
          ? await createRolePermissionAction(selectedTarget.id, permissionId, { level: next.level })
          : await createUserPermissionAction(selectedTarget.id, permissionId, { level: next.level });
      } else {
        result = selectedTarget.type === "role"
          ? await deleteRolePermissionAction(selectedTarget.id, permissionId)
          : await deleteUserPermissionAction(selectedTarget.id, permissionId);
      }
      if (!result.success) {
        throw new Error(result.error?.message || "No se pudo actualizar el permiso");
      }
      setRowStates((prev) => ({ ...prev, [permissionId]: next }));
    } catch (error: any) {
      setSaveError(error?.message || "No se pudo actualizar el permiso");
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(permissionId);
        return next;
      });
    }
  };

  const grantAllPermissions = async () => {
    if (!selectedTarget || isBulkUpdating) return;
    const toAssign = permissionsCatalog
      .filter((p) => !rowStates[p.id_permission]?.assigned)
      .map((p) => p.id_permission);
    if (toAssign.length === 0) return;

    setIsBulkUpdating(true);
    setSaveError(null);
    try {
      const results = await Promise.all(
        toAssign.map((permissionId) =>
          selectedTarget.type === "role"
            ? createRolePermissionAction(selectedTarget.id, permissionId, { level: DEFAULT_LEVEL })
            : createUserPermissionAction(selectedTarget.id, permissionId, { level: DEFAULT_LEVEL })
        )
      );
      const failed = results.find((r) => !r.success);
      if (failed) {
        throw new Error(failed.error?.message || "No se pudieron asignar todos los permisos");
      }
      setRowStates((prev) => {
        const next = { ...prev };
        toAssign.forEach((id) => (next[id] = { assigned: true, level: DEFAULT_LEVEL }));
        return next;
      });
    } catch (error: any) {
      setSaveError(error?.message || "No se pudieron asignar todos los permisos");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const revokeAllPermissions = async () => {
    if (!selectedTarget || isBulkUpdating) return;
    const toRevoke = permissionsCatalog
      .filter((p) => rowStates[p.id_permission]?.assigned)
      .map((p) => p.id_permission);
    if (toRevoke.length === 0) return;

    setIsBulkUpdating(true);
    setSaveError(null);
    try {
      const results = await Promise.all(
        toRevoke.map((permissionId) =>
          selectedTarget.type === "role"
            ? deleteRolePermissionAction(selectedTarget.id, permissionId)
            : deleteUserPermissionAction(selectedTarget.id, permissionId)
        )
      );
      const failed = results.find((r) => !r.success);
      if (failed) {
        throw new Error(failed.error?.message || "No se pudieron revocar todos los permisos");
      }
      setRowStates((prev) => {
        const next = { ...prev };
        toRevoke.forEach((id) => (next[id] = { ...next[id], assigned: false }));
        return next;
      });
    } catch (error: any) {
      setSaveError(error?.message || "No se pudieron revocar todos los permisos");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const totalPermissions = permissionsCatalog.length;
    const assignedCount = permissionsCatalog.filter((p) => rowStates[p.id_permission]?.assigned).length;

    return { totalPermissions, assignedCount };
  }, [permissionsCatalog, rowStates]);

  const columns: ColumnDef<IPermission>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Permiso",
        cell: ({ row }) => {
          const permission = row.original;
          return (
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0'>
                <RiKeyLine className='w-4 h-4 text-primary' />
              </div>
              <div className='min-w-0'>
                <p className='text-sm font-medium text-foreground truncate'>{permission.name}</p>
                <p className='text-xs text-muted-foreground font-mono truncate'>
                  {permission.resource} · {permission.action}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "permission_type",
        header: "Tipo",
        cell: ({ row }) => (
          <span className='text-xs text-muted-foreground'>{row.original.permission_type}</span>
        ),
      },
      {
        id: "assigned",
        header: "Asignado",
        cell: ({ row }) => {
          const permission = row.original;
          const state = rowStates[permission.id_permission] ?? { assigned: false, level: DEFAULT_LEVEL };
          const disabled = !selectedTarget || isLoadingAssignments || isBulkUpdating || loadingIds.has(permission.id_permission);
          return (
            <div className='w-16 flex justify-center shrink-0'>
              <PermissionCheckbox
                checked={state.assigned}
                disabled={disabled}
                onChange={() => handleToggle(permission.id_permission)}
              />
            </div>
          );
        },
      },
    ],
    [rowStates, selectedTarget, isLoadingAssignments, isBulkUpdating, loadingIds, handleToggle],
  );

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold text-foreground'>
              Asignacion de Permisos
            </h1>
            <p className='text-muted-foreground mt-1'>
              Configura los permisos de acceso para roles o usuarios
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => selectedTarget && (selectedTarget.type === "role" ? handleRoleChange(selectedTarget.id) : handleUserChange(selectedTarget.id))}
              disabled={!selectedTarget}
              className='flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
              <RiRefreshLine className='w-4 h-4' />
              Actualizar
            </button>
          </div>
        </div>

        {saveError && (
          <div className='flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
            <RiCloseLine className='w-4 h-4 shrink-0' />
            <span>{saveError}</span>
          </div>
        )}

        {/* Application Selector */}
        <div className='bg-card rounded-xl border border-border p-4'>
          <div className='flex flex-col gap-4'>
            <div>
              <label className='text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2'>
                <RiAppsLine className='w-4 h-4' />
                Seleccionar Aplicación
              </label>
              <div className='relative'>
                {/* Searchable Select for Applications */}
                <SearchableSelect
                  value={selectedApplication ? String(selectedApplication) : undefined}
                  onValueChange={(value) => {
                    console.log('Selected application:', value);
                    handleApplicationChange(Number(value))
                  }}
                  disabled={applications.length === 0}
                  placeholder='Seleccione una aplicación'
                  searchPlaceholder='Buscar aplicación...'
                  emptyMessage='No se encontraron aplicaciones'
                  triggerClassName='!h-16 data-[size=default]:h-16 px-3 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 *:data-[slot=select-value]:line-clamp-none'
                  options={applications.map((app) => ({
                    value: String(app.id_application),
                    label: (
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-lg flex items-center justify-center bg-[hsl(var(--primary)/0.12)]'>
                          <RiGlobalLine className='w-4 h-4 text-[hsl(var(--primary))]' />
                        </div>
                        <div className='flex-1 text-left'>
                          <p className='text-sm font-medium text-[hsl(var(--foreground))]'>
                            {app.name}
                          </p>
                        </div>
                      </div>
                    ),
                  }))}
                />
              </div>
            </div>
            <div className='border-t border-border pt-4'>
              <div className='flex items-center gap-2 mb-3'>
                <RiDatabase2Line className='w-4 h-4 text-muted-foreground' />
                <p className='text-sm font-medium text-muted-foreground'>Aplicación seleccionada</p>
              </div>
              {selectedApplication && applications.find(a => a.id_application === selectedApplication) ? (
                <div className='bg-primary/5 border border-primary/20 rounded-lg p-3'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
                      <RiGlobalLine className='w-5 h-5 text-primary' />
                    </div>
                    <div className='flex-1'>
                      <p className='font-semibold text-foreground text-sm'>
                        {applications.find(a => a.id_application === selectedApplication)?.name}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='bg-muted/30 border border-muted rounded-lg p-3'>
                  <div className='flex items-center gap-3 text-muted-foreground'>
                    <div className='w-10 h-10 bg-muted rounded-lg flex items-center justify-center'>
                      <RiAppsLine className='w-5 h-5' />
                    </div>
                    <div>
                      <p className='font-medium text-sm'>Sin aplicación seleccionada</p>
                      <p className='text-xs mt-0.5'>Selecciona una aplicación para continuar</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Target Selector */}
        <div className='bg-card rounded-xl border border-border p-4'>
          <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-2'>
              <RiShieldUserLine className='w-4 h-4 text-muted-foreground' />
              <label className='text-sm font-medium text-muted-foreground'>
                Asignar permisos a
              </label>
            </div>

            <div className='flex flex-col md:flex-row md:items-start gap-4'>
              <div className='flex-1 space-y-4'>
                <div>
                  <label className='text-xs font-medium text-muted-foreground mb-1.5 block'>
                    Rol
                  </label>
                  {isLoadingRoles ? (
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <div className='w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin' />
                      Cargando roles...
                    </div>
                  ) : roles.length === 0 ? (
                    <p className='text-sm text-muted-foreground'>
                      No hay roles disponibles para esta aplicación
                    </p>
                  ) : (
                    <div className='flex flex-wrap gap-2'>
                      {roles.map((role) => (
                        <button
                          key={role.id_role}
                          onClick={() => handleRoleChange(role.id_role)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                            selectedRole === role.id_role
                              ? "bg-primary text-primary-foreground shadow-lg scale-105"
                              : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                          }`}>
                          <span className='font-medium'>{role.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className='text-xs font-medium text-muted-foreground mb-1.5 block'>
                    Usuario
                  </label>
                  <UserSearchableSelect
                    applicationId={selectedApplication}
                    value={selectedUser}
                    onChange={handleUserChange}
                    disabled={!selectedApplication}
                  />
                </div>
              </div>

              {selectedRoleData && (
                <div className='md:border-l border-t md:border-t-0 border-border pt-4 md:pt-0 md:pl-4 min-w-[180px]'>
                  <p className='text-sm text-muted-foreground'>Rol seleccionado</p>
                  {isLoadingAssignments ? (
                    <div className='flex items-center gap-2'>
                      <div className='w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin' />
                      <span className='text-sm'>Cargando permisos...</span>
                    </div>
                  ) : (
                    <>
                      <p className='font-medium text-foreground'>
                        {selectedRoleData.name}
                      </p>
                      <p className='text-xs text-muted-foreground mt-0.5'>
                        {selectedRoleData.description}
                      </p>
                    </>
                  )}
                </div>
              )}

              {selectedUser && !selectedRoleData && (
                <div className='md:border-l border-t md:border-t-0 border-border pt-4 md:pt-0 md:pl-4 min-w-[180px]'>
                  <p className='text-sm text-muted-foreground'>Usuario seleccionado</p>
                  <p className='font-medium text-foreground'>ID {selectedUser}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='bg-card rounded-xl border border-border p-4'>
            <div className='flex items-center gap-2 text-muted-foreground mb-1'>
              <RiLockLine className='w-4 h-4' />
              <span className='text-xs font-medium'>Total Permisos</span>
            </div>
            <p className='text-2xl font-bold text-foreground'>
              {stats.totalPermissions}
            </p>
          </div>
          <div className='bg-card rounded-xl border border-border p-4'>
            <div className='flex items-center gap-2 text-primary mb-1'>
              <RiCheckboxCircleFill className='w-4 h-4' />
              <span className='text-xs font-medium'>Asignados</span>
            </div>
            <p className='text-2xl font-bold text-foreground'>
              {stats.assignedCount}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className='bg-card rounded-xl border border-border overflow-hidden p-4'>
          {isLoadingCatalog ? (
            <div className='flex items-center justify-center py-12 text-muted-foreground'>
              <div className='flex flex-col items-center gap-3'>
                <div className='w-8 h-8 border-4 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin' />
                <p>Cargando permisos...</p>
              </div>
            </div>
          ) : permissionsCatalog.length === 0 ? (
            <div className='flex items-center justify-center py-12 text-muted-foreground'>
              <p>No hay permisos disponibles para esta aplicación</p>
            </div>
          ) : !selectedTarget ? (
            <div className='flex items-center justify-center py-12 text-muted-foreground'>
              <p>Selecciona un rol o usuario para gestionar permisos</p>
            </div>
          ) : isLoadingAssignments ? (
            <div className='flex items-center justify-center py-12 text-muted-foreground'>
              <div className='flex flex-col items-center gap-3'>
                <div className='w-8 h-8 border-4 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin' />
                <p>Cargando asignaciones...</p>
              </div>
            </div>
          ) : (
            <DataTable
              data={permissionsCatalog}
              columns={columns}
              headerTable={() => (
                <div className='flex items-center justify-end gap-2 pb-2'>
                  <button
                    onClick={grantAllPermissions}
                    disabled={!selectedTarget || isBulkUpdating}
                    className='flex items-center gap-1 px-3 py-1.5 text-sm bg-primary/20 text-primary hover:bg-primary/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                    <RiCheckDoubleLine className='w-4 h-4' />
                    Otorgar Todo
                  </button>
                  <button
                    onClick={revokeAllPermissions}
                    disabled={!selectedTarget || isBulkUpdating}
                    className='flex items-center gap-1 px-3 py-1.5 text-sm bg-destructive/20 text-destructive hover:bg-destructive/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                    <RiCloseLine className='w-4 h-4' />
                    Revocar Todo
                  </button>
                </div>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}
