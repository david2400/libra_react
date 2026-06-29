"use client";

import { useState, useMemo, useEffect } from "react";
import {
  RiDashboardLine,
  RiUserLine,
  RiListUnordered,
  RiShieldUserLine,
  RiGroupLine,
  RiShoppingBagLine,
  RiBookOpenLine,
  RiArchiveLine,
  RiFolderLine,
  RiFileListLine,
  RiTimeLine,
  RiCheckLine,
  RiArrowGoBackLine,
  RiBarChartLine,
  RiLineChartLine,
  RiPieChartLine,
  RiSettingsLine,
  RiToolsLine,
  RiNotificationLine,
  RiPlugLine,
  RiSearchLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiCheckboxCircleFill,
  RiCheckboxBlankCircleLine,
  RiCheckboxIndeterminateLine,
  RiSaveLine,
  RiRefreshLine,
  RiFilterLine,
  RiCloseLine,
  RiEyeLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckDoubleLine,
  RiAppsLine,
  RiGlobalLine,
  RiDatabase2Line,
} from "react-icons/ri";
import type { MenuItem, MenuPermission } from "../models/menu-permission.interface";
import { menuItems, roles, initialPermissions } from "../mocks/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SearchableSelect } from "@repo/ui/inputs/scenes/select";
import { IRoleSearch } from "@/server/domains/access-control/security/roles";
import { IMenuSearch } from "@/server/domains/access-control/navigation/menus";
import { listRolesByApplicationAction } from "../actions/role.actions";
import { listMenusByApplicationAction } from "../actions/menu.actions";
// import { getApplications } from "@/server/domains/access-control/security/applications";

// import { PermissionType } from "@/modules/security/permissions/models/permission.interface";

// Local type for menu permission actions
type MenuPermissionType = "view" | "create" | "edit" | "delete";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  RiDashboardLine,
  RiUserLine,
  RiListUnordered,
  RiShieldUserLine,
  RiGroupLine,
  RiShoppingBagLine,
  RiBookOpenLine,
  RiArchiveLine,
  RiFolderLine,
  RiFileListLine,
  RiTimeLine,
  RiCheckLine,
  RiArrowGoBackLine,
  RiBarChartLine,
  RiLineChartLine,
  RiPieChartLine,
  RiSettingsLine,
  RiToolsLine,
  RiNotificationLine,
  RiPlugLine,
};

interface PermissionCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function PermissionCheckbox({
  checked,
  indeterminate,
  onChange,
  disabled,
}: PermissionCheckboxProps) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`w-5 h-5 flex items-center justify-center rounded transition-all duration-200 ${disabled
        ? "opacity-50 cursor-not-allowed"
        : "cursor-pointer hover:scale-110"
        } ${checked ? "text-primary" : indeterminate ? "text-warning" : "text-muted-foreground"}`}>
      {checked ? (
        <RiCheckboxCircleFill className='w-5 h-5' />
      ) : indeterminate ? (
        <RiCheckboxIndeterminateLine className='w-5 h-5' />
      ) : (
        <RiCheckboxBlankCircleLine className='w-5 h-5' />
      )}
    </button>
  );
}

interface MenuItemRowProps {
  menu: MenuItem;
  level: number;
  expanded: Set<string>;
  toggleExpand: (id: string) => void;
  permissions: MenuPermission[];
  selectedRole: string | null;
  onPermissionChange: (
    menuId: string,
    type: MenuPermissionType,
    value: boolean,
  ) => void;
  searchQuery: string;
}

function MenuItemRow({
  menu,
  level,
  expanded,
  toggleExpand,
  permissions,
  selectedRole,
  onPermissionChange,
  searchQuery,
}: MenuItemRowProps) {
  const Icon = iconMap[menu.icon] || RiFolderLine;
  const hasChildren = menu.children && menu.children.length > 0;
  const isExpanded = expanded.has(menu.id);

  const permission = permissions.find(
    (p) => p.menu_id === menu.id && p.role_id === selectedRole,
  );

  const matchesSearch =
    searchQuery === "" ||
    menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    menu.path.toLowerCase().includes(searchQuery.toLowerCase());

  const childrenMatch =
    menu.children?.some(
      (child) =>
        child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.path.toLowerCase().includes(searchQuery.toLowerCase()),
    ) ?? false;

  if (!matchesSearch && !childrenMatch && searchQuery !== "") {
    return null;
  }

  // Calculate child permission states for indeterminate
  const getChildrenPermissionState = (
    type: MenuPermissionType,
  ): "all" | "none" | "some" => {
    if (!menu.children) return "none";
    const childPerms = menu.children
      .map((child) =>
        permissions.find(
          (p) => p.menu_id === child.id && p.role_id === selectedRole,
        ),
      )
      .filter(Boolean);

    if (childPerms.length === 0) return "none";

    const key =
      `can_${type}` as keyof MenuPermission;
    const allChecked = childPerms.every((p) => p && p[key] === true);
    const noneChecked = childPerms.every((p) => !p || p[key] === false);

    if (allChecked) return "all";
    if (noneChecked) return "none";
    return "some";
  };

  return (
    <>
      <div
        className={`group flex items-center gap-4 py-3 px-4 hover:bg-secondary/50 transition-colors border-b border-border/50 ${level > 0 ? "bg-secondary/20" : ""
          }`}
        style={{ paddingLeft: `${level * 24 + 16}px` }}>
        {/* Expand/Collapse Button */}
        <div className='w-5'>
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(menu.id)}
              className='p-0.5 rounded hover:bg-secondary transition-colors'>
              {isExpanded ? (
                <RiArrowDownSLine className='w-4 h-4 text-muted-foreground' />
              ) : (
                <RiArrowRightSLine className='w-4 h-4 text-muted-foreground' />
              )}
            </button>
          ) : (
            <span className='w-4' />
          )}
        </div>

        {/* Icon & Name */}
        <div className='flex items-center gap-3 flex-1 min-w-[200px]'>
          <div className='w-8 h-8 rounded-lg bg-secondary flex items-center justify-center'>
            <Icon className='w-4 h-4 text-primary' />
          </div>
          <div>
            <p className='text-sm font-medium text-foreground'>{menu.name}</p>
            <p className='text-xs text-muted-foreground font-mono'>
              {menu.path}
            </p>
          </div>
        </div>

        {/* IPermission Checkboxes */}
        <div className='flex items-center gap-8'>
          {(["view", "create", "edit", "delete"] as MenuPermissionType[]).map(
            (type) => {
              const key = `can${type.charAt(0).toUpperCase()}${type.slice(1)}` as keyof MenuPermission;
              const checked = permission ? (permission[key] as any) : false;
              const childState = hasChildren ? getChildrenPermissionState(type) : "none";
              const indeterminate = hasChildren && childState === "some";

              return (
                <div key={type} className='w-12 flex justify-center'>
                  <PermissionCheckbox
                    checked={checked || (hasChildren && childState === "all")}
                    indeterminate={indeterminate}
                    onChange={() => onPermissionChange(menu.id, type, !checked)}
                  />
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className='animate-in slide-in-from-top-2 duration-200'>
          {menu.children!.map((child) => (
            <MenuItemRow
              key={child.id}
              menu={child}
              level={level + 1}
              expanded={expanded}
              toggleExpand={toggleExpand}
              permissions={permissions}
              selectedRole={selectedRole}
              onPermissionChange={onPermissionChange}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </>
  );
}

export function RolePermissionManager() {
  const [permissions, setPermissions] =
    useState<MenuPermission[]>(initialPermissions);
  const [selectedApplication, setSelectedApplication] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(menuItems.map((m) => m.id)),
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Real data from server actions
  const [applications, setApplications] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);

  // Load applications on mount
  useEffect(() => {
    const loadApplications = async () => {
      try {
        const { listApplicationsAction } = await import('../actions/role.actions');
        const result = await listApplicationsAction();
        console.log(result);
        // Handle both possible response structures
        setApplications(Array.isArray(result) ? result : []);

      } catch (error) {
        console.error('Error loading applications:', error);
        setApplications([]);
      }
    };

    loadApplications();
  }, []);

  // Load roles when application changes


  // Get roles for selected application
  const currentRoles = roles;

  // Reset role when application changes
  const handleApplicationChange = (appId: number) => {
    setSelectedApplication(appId);
    loadRoles({ application_id: appId });
    loadMenus({ application_id: appId });
  };

  const loadRoles = async (params: IRoleSearch) => {

    try {
      console.log('Loading roles for application:', params);
      const result = await listRolesByApplicationAction(params);
      console.log('Loading roles for application:', result);
      setRoles(result);
      // Auto-select first role if available
      // if (result.data.length > 0 && !selectedRole) {
      //   setSelectedRole(result.data[0].id_role);
      // }
    } catch (error) {

    }
  };

  const loadMenus = async (params: IMenuSearch) => {
    try {
      console.log('Loading menus for application:', params);
      const result = await listMenusByApplicationAction(params);
      console.log('Loading menus for application:', result);
      setMenus(result);
      // Auto-select first menu if available
      // if (result.data.length > 0 && !selectedMenu) {
      //   setSelectedMenu(result.data[0].id_menu);
      // }
    } catch (error) {
      console.error('Failed to load menus:', error);
    }
  };

  // Load permissions for a role
  const loadPermissionsForRole = async (roleId: string) => {
    if (!roleId) return;

    setIsLoading(true);
    try {
      const { listPermissionsByRoleAction } = await import('../actions/role.actions');
      const result = await listPermissionsByRoleAction(roleId);

      if (result.success) {
        // Convert server permissions to MenuPermission format
        const formattedPerms: MenuPermission[] = result.data.map(perm => ({
          menu_id: perm.permission_id.toString(),
          role_id: perm.role_id.toString(),
          can_view: perm.is_active, // Simplified mapping
          can_create: perm.is_active,
          can_edit: perm.is_active,
          can_delete: perm.is_active,
        }));
        setPermissions(formattedPerms);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle role change
  const handleRoleChange = (roleId: string) => {
    if (!roleId) return;
    setSelectedRole(roleId);
    loadPermissionsForRole(roleId);
  };

  // // Initialize permissions on component mount
  // useEffect(() => {
  //   if (currentRoles.length > 0 && currentRoles[0].id_role) {
  //     loadPermissionsForRole(currentRoles[0].id_role);
  //   }
  // }, [selectedApplication]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedRoleData = currentRoles.find((r) => r.id_role === selectedRole);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    menuItems.forEach((menu) => {
      allIds.add(menu.id);
      menu.children?.forEach((child) => allIds.add(child.id));
    });
    setExpanded(allIds);
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  const handlePermissionChange = (
    menuId: string,
    type: MenuPermissionType,
    value: boolean,
  ) => {
    setHasChanges(true);
    setPermissions((prev) => {
      const newPermissions = [...prev];
      const existingIndex = newPermissions.findIndex(
        (p) => p.menu_id === menuId && p.role_id === selectedRole,
      );

      const key =
        `can_${type}` as keyof MenuPermission;

      if (existingIndex !== -1) {
        newPermissions[existingIndex] = {
          ...newPermissions[existingIndex],
          [key]: value,
        };
      } else {
        newPermissions.push({
          menu_id: menuId,
          role_id: selectedRole || '',
          can_view: type === "view" ? value : false,
          can_create: type === "create" ? value : false,
          can_edit: type === "edit" ? value : false,
          can_delete: type === "delete" ? value : false,
        });
      }

      // If parent, update all children
      const parentMenu = menuItems.find((m) => m.id === menuId);
      if (parentMenu?.children) {
        parentMenu.children.forEach((child) => {
          const childIndex = newPermissions.findIndex(
            (p) => p.menu_id === child.id && p.role_id === selectedRole,
          );
          if (childIndex !== -1) {
            newPermissions[childIndex] = {
              ...newPermissions[childIndex],
              [key]: value,
            };
          } else {
            newPermissions.push({
              menu_id: child.id,
              role_id: selectedRole || '',
              can_view: type === "view" ? value : false,
              can_create: type === "create" ? value : false,
              can_edit: type === "edit" ? value : false,
              can_delete: type === "delete" ? value : false,
            });
          }
        });
      }

      return newPermissions;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setHasChanges(false);
  };

  const handleReset = () => {
    setPermissions(initialPermissions);
    setHasChanges(false);
  };

  const grantAllPermissions = () => {
    setHasChanges(true);
    const allPermissions: MenuPermission[] = [];
    menuItems.forEach((menu) => {
      allPermissions.push({
        menu_id: menu.id,
        role_id: selectedRole || '',
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
      });
      menu.children?.forEach((child) => {
        allPermissions.push({
          menu_id: child.id,
          role_id: selectedRole || '',
          can_view: true,
          can_create: true,
          can_edit: true,
          can_delete: true,
        });
      });
    });
    setPermissions((prev) => {
      const otherRoles = prev.filter((p) => p.role_id !== selectedRole);
      return [...otherRoles, ...allPermissions];
    });
  };

  const revokeAllPermissions = () => {
    setHasChanges(true);
    setPermissions((prev) => prev.filter((p) => p.role_id !== selectedRole));
  };

  // Stats
  const stats = useMemo(() => {
    const rolePermissions = permissions.filter(
      (p) => p.role_id === selectedRole,
    );
    const totalMenus = menuItems.reduce(
      (acc, m) => acc + 1 + (m.children?.length || 0),
      0,
    );
    const viewCount = rolePermissions.filter((p) => p.can_view).length;
    const createCount = rolePermissions.filter((p) => p.can_create).length;
    const editCount = rolePermissions.filter((p) => p.can_edit).length;
    const deleteCount = rolePermissions.filter((p) => p.can_delete).length;

    return { totalMenus, viewCount, createCount, editCount, deleteCount };
  }, [permissions, selectedRole]);

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold text-foreground'>
              Permisos de Menú
            </h1>
            <p className='text-muted-foreground mt-1'>
              Configura los permisos de acceso para cada rol del sistema
            </p>
          </div>
          <div className='flex items-center gap-3'>
            {hasChanges && (
              <span className='text-sm text-warning flex items-center gap-1'>
                <span className='w-2 h-2 bg-warning rounded-full animate-pulse' />
                Cambios sin guardar
              </span>
            )}
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className='flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
              <RiRefreshLine className='w-4 h-4' />
              Restablecer
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className='flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
              {isSaving ? (
                <div className='w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin' />
              ) : (
                <RiSaveLine className='w-4 h-4' />
              )}
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>

        {/* Application & Role Selector */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
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
                      keywords: app.code ?? '',
                      label: (
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 rounded-lg flex items-center justify-center bg-[hsl(var(--primary)/0.12)]'>
                            <RiGlobalLine className='w-4 h-4 text-[hsl(var(--primary))]' />
                          </div>
                          <div className='flex-1 text-left'>
                            <p className='text-sm font-medium text-[hsl(var(--foreground))]'>
                              {app.name}
                            </p>
                            {app.code && (
                              <p className='text-xs text-[hsl(var(--muted-foreground))] font-mono mt-0.5'>
                                {app.code}
                              </p>
                            )}
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
                        {applications.find(a => a.id_application === selectedApplication)?.code && (
                          <p className='text-xs text-primary font-mono mt-0.5'>
                            {applications.find(a => a.id_application === selectedApplication)?.code}
                          </p>
                        )}
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

          {/* Role Selector */}
          <div className='bg-card rounded-xl border border-border p-4'>
            <div className='flex flex-col gap-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground mb-2 block'>
                  Seleccionar Rol
                </label>
                <div className='flex flex-wrap gap-2'>
                  {currentRoles.map((role) => (
                    <button
                      key={role.id_role}
                      onClick={() => handleRoleChange(role.id_role)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${selectedRole === role.id_role
                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                        : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                        }`}>
                      <span
                        className='w-3 h-3 rounded-full'
                        style={{ backgroundColor: role.color || '#6b7280' }}
                      />
                      <span className='font-medium'>{role.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className='border-t border-border pt-4'>
                <p className='text-sm text-muted-foreground'>Rol seleccionado</p>
                <p className='font-medium text-foreground'>
                  {selectedRoleData?.name || 'Sin rol seleccionado'}
                </p>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  {selectedRoleData?.description || 'Sin descripción'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
          <div className='bg-card rounded-xl border border-border p-4'>
            <div className='flex items-center gap-2 text-muted-foreground mb-1'>
              <RiFolderLine className='w-4 h-4' />
              <span className='text-xs font-medium'>Total Menús</span>
            </div>
            <p className='text-2xl font-bold text-foreground'>
              {stats.totalMenus}
            </p>
          </div>
          <div className='bg-card rounded-xl border border-border p-4'>
            <div className='flex items-center gap-2 text-primary mb-1'>
              <RiEyeLine className='w-4 h-4' />
              <span className='text-xs font-medium'>Ver</span>
            </div>
            <p className='text-2xl font-bold text-foreground'>
              {stats.viewCount}
            </p>
          </div>
          <div className='bg-card rounded-xl border border-border p-4'>
            <div className='flex items-center gap-2 text-blue-400 mb-1'>
              <RiAddLine className='w-4 h-4' />
              <span className='text-xs font-medium'>Crear</span>
            </div>
            <p className='text-2xl font-bold text-foreground'>
              {stats.createCount}
            </p>
          </div>
          <div className='bg-card rounded-xl border border-border p-4'>
            <div className='flex items-center gap-2 text-warning mb-1'>
              <RiEditLine className='w-4 h-4' />
              <span className='text-xs font-medium'>Editar</span>
            </div>
            <p className='text-2xl font-bold text-foreground'>
              {stats.editCount}
            </p>
          </div>
          <div className='bg-card rounded-xl border border-border p-4'>
            <div className='flex items-center gap-2 text-destructive mb-1'>
              <RiDeleteBinLine className='w-4 h-4' />
              <span className='text-xs font-medium'>Eliminar</span>
            </div>
            <p className='text-2xl font-bold text-foreground'>
              {stats.deleteCount}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className='bg-card rounded-xl border border-border overflow-hidden'>
          {/* Toolbar */}
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-b border-border bg-secondary/30'>
            {/* Search */}
            <div className='relative flex-1 max-w-md'>
              <RiSearchLine className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <input
                type='text'
                placeholder='Buscar menú...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-10 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50'
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'>
                  <RiCloseLine className='w-4 h-4' />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className='flex items-center gap-2'>
              <button
                onClick={expandAll}
                className='flex items-center gap-1 px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-secondary-foreground'>
                <RiArrowDownSLine className='w-4 h-4' />
                Expandir
              </button>
              <button
                onClick={collapseAll}
                className='flex items-center gap-1 px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-secondary-foreground'>
                <RiArrowRightSLine className='w-4 h-4' />
                Colapsar
              </button>
              <div className='w-px h-6 bg-border mx-2' />
              <button
                onClick={grantAllPermissions}
                className='flex items-center gap-1 px-3 py-1.5 text-sm bg-primary/20 text-primary hover:bg-primary/30 rounded-lg transition-colors'>
                <RiCheckDoubleLine className='w-4 h-4' />
                Otorgar Todo
              </button>
              <button
                onClick={revokeAllPermissions}
                className='flex items-center gap-1 px-3 py-1.5 text-sm bg-destructive/20 text-destructive hover:bg-destructive/30 rounded-lg transition-colors'>
                <RiCloseLine className='w-4 h-4' />
                Revocar Todo
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className='flex items-center gap-4 py-3 px-4 bg-secondary/50 border-b border-border text-sm font-medium text-muted-foreground'>
            <div className='w-5' />
            <div className='flex-1 min-w-[200px]'>Menú</div>
            <div className='flex items-center gap-8'>
              <div className='w-12 flex justify-center items-center gap-1'>
                <RiEyeLine className='w-4 h-4' />
                Ver
              </div>
              <div className='w-12 flex justify-center items-center gap-1'>
                <RiAddLine className='w-4 h-4' />
                Crear
              </div>
              <div className='w-12 flex justify-center items-center gap-1'>
                <RiEditLine className='w-4 h-4' />
                Editar
              </div>
              <div className='w-12 flex justify-center items-center gap-1'>
                <RiDeleteBinLine className='w-4 h-4' />
                Eliminar
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className='max-h-[calc(100vh-500px)] overflow-y-auto'>
            {menuItems.map((menu) => (
              <MenuItemRow
                key={menu.id}
                menu={menu}
                level={0}
                expanded={expanded}
                toggleExpand={toggleExpand}
                permissions={permissions}
                selectedRole={selectedRole}
                onPermissionChange={handlePermissionChange}
                searchQuery={searchQuery}
              />
            ))}
          </div>

          {/* Footer */}
          <div className='flex items-center justify-between p-4 border-t border-border bg-secondary/30'>
            <p className='text-sm text-muted-foreground'>
              {stats.viewCount +
                stats.createCount +
                stats.editCount +
                stats.deleteCount}{" "}
              permisos asignados para{" "}
              <span className='font-medium text-foreground'>
                {selectedRoleData?.name || 'Sin rol'}
              </span>
            </p>
            <div className='flex items-center gap-2'>
              <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                <RiCheckboxCircleFill className='w-4 h-4 text-primary' />
                Permitido
              </span>
              <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                <RiCheckboxIndeterminateLine className='w-4 h-4 text-warning' />
                Parcial
              </span>
              <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                <RiCheckboxBlankCircleLine className='w-4 h-4' />
                Denegado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
