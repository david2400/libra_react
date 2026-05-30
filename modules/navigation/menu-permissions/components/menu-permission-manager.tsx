/** @format */

"use client";

import { useState, useMemo, useEffect, useCallback, useTransition } from "react";
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
} from "react-icons/ri";
import type {
  IMenuRolePermission,
  MenuItem,
} from "../models/menu-permission.interface";
import type { IApplication } from "@/server/domains/access-control/security/applications";
import type { IRole } from "@/server/domains/access-control/security/roles";
import type { IMenu } from "@/server/domains/access-control/navigation/menus";
import {
  getApplicationsServerAction,
  getRolesByApplicationServerAction,
  getMenusByApplicationServerAction,
  getMenuPermissionsServerAction,
} from "@/app/[locale]/(protected)/navigation/menu-permissions/actions";

type MenuPermissionAction = "view" | "create" | "edit" | "delete";

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
      className={`w-5 h-5 flex items-center justify-center rounded transition-all duration-200 ${
        disabled
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
  permissions: IMenuRolePermission[];
  selectedRole: number | null;
  onPermissionChange: (
    menuId: string,
    type: MenuPermissionAction,
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
    (p) => p.menu_id === Number(menu.id) && p.role_id === selectedRole,
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
    type: MenuPermissionAction,
  ): "all" | "none" | "some" => {
    if (!menu.children) return "none";
    const childPerms = menu.children
      .map((child) =>
        permissions.find(
          (p) => p.menu_id === Number(child.id) && p.role_id === selectedRole,
        ),
      )
      .filter(Boolean);

    if (childPerms.length === 0) return "none";

    const key =
      `can_${type}` as keyof IMenuRolePermission;
    const allChecked = childPerms.every((p) => p && p[key] === true);
    const noneChecked = childPerms.every((p) => !p || p[key] === false);

    if (allChecked) return "all";
    if (noneChecked) return "none";
    return "some";
  };

  return (
    <>
      <div
        className={`group flex items-center gap-4 py-3 px-4 hover:bg-secondary/50 transition-colors border-b border-border/50 ${
          level > 0 ? "bg-secondary/20" : ""
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
          {(["view", "create", "edit", "delete"] as MenuPermissionAction[]).map(
            (type) => {
              const key =
                `can_${type}` as keyof IMenuRolePermission;
              const checked = permission ? (permission[key] as boolean) : false;
              const childState = hasChildren
                ? getChildrenPermissionState(type)
                : "none";
              const indeterminate = hasChildren && childState === "some";

              return (
                <div key={type} className='w-12 flex justify-center'>
                  <PermissionCheckbox
                    checked={Boolean(checked || (hasChildren && childState === "all"))}
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

export function MenuPermissionsManager() {
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<number | null>(null);
  const [roles, setRoles] = useState<IRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [permissions, setPermissions] = useState<IMenuRolePermission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedRoleData = roles.find((r) => r.id_role === selectedRole);

  useEffect(() => {
    loadApplications();
  }, []);


  const loadApplications = async () => {
    try {
      setIsLoadingApps(true);
      const apps = await getApplicationsServerAction();
      console.log('Apps received:', apps);
      
      if (apps && Array.isArray(apps)) {
        setApplications(apps);
      } else {
        console.error('Apps is not an array:', apps);
        setApplications([]);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      setApplications([]);
    } finally {
      setIsLoadingApps(false);
    }
  };

  const loadRolesAndMenus = async (applicationId: number) => {
    try {
      setIsLoadingRoles(true);
      setIsLoadingMenus(true);
      
      const [rolesData, menusData, permissionsData] = await Promise.all([
        getRolesByApplicationServerAction(applicationId),
        getMenusByApplicationServerAction(applicationId),
        getMenuPermissionsServerAction(applicationId),
      ]);

      console.log('Roles data:', rolesData);
      console.log('Menus data:', menusData);
      console.log('Permissions data:', permissionsData);

      const validRoles = Array.isArray(rolesData) ? rolesData : [];
      const validMenus = Array.isArray(menusData) ? menusData : [];
      const validPermissions = Array.isArray(permissionsData) ? permissionsData : [];

      setRoles(validRoles);
      setMenuItems(transformMenusToMenuItems(validMenus));
      setPermissions(transformPermissionsToMenuRolePermissions(validPermissions));
      
      if (validRoles.length > 0) {
        setSelectedRole(validRoles[0].id_role);
      } else {
        setSelectedRole(null);
      }
      
      const menuIds = validMenus.map(m => m.id_menu.toString());
      setExpanded(new Set(menuIds));
      
    } catch (error) {
      console.error('Error loading roles and menus:', error);
      setRoles([]);
      setMenuItems([]);
      setPermissions([]);
      setSelectedRole(null);
    } finally {
      setIsLoadingRoles(false);
      setIsLoadingMenus(false);
    }
  };

  const transformMenusToMenuItems = (menus: IMenu[]): MenuItem[] => {
    const menuMap = new Map<number, MenuItem>();
    const rootMenus: MenuItem[] = [];

    menus.forEach(menu => {
      menuMap.set(menu.id_menu, {
        id: menu.id_menu.toString(),
        name: menu.name,
        icon: menu.icon || 'RiFolderLine',
        path: menu.path,
        children: [],
      });
    });

    menus.forEach(menu => {
      const menuItem = menuMap.get(menu.id_menu)!;
      if (menu.parent_menu_id) {
        const parent = menuMap.get(menu.parent_menu_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(menuItem);
        }
      } else {
        rootMenus.push(menuItem);
      }
    });

    return rootMenus;
  };

  const transformPermissionsToMenuRolePermissions = (permissionsData: any[]): IMenuRolePermission[] => {
    return permissionsData.map(p => ({
      menu_id: p.menu_id,
      role_id: p.role_id,
      can_view: p.can_view || false,
      can_create: p.can_create || false,
      can_edit: p.can_edit || false,
      can_delete: p.can_delete || false,
    }));
  };

  const handleApplicationChange = useCallback((applicationId: number) => {
    startTransition(() => {
      loadRolesAndMenus(applicationId);

      setHasChanges(false);
    });
  }, []);

  const handleRoleChange = useCallback((roleId: number) => {
    setSelectedRole(roleId);
  }, []);

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
    type: MenuPermissionAction,
    value: boolean,
  ) => {
    if (!selectedRole) return;
    
    setHasChanges(true);
    setPermissions((prev) => {
      const newPermissions = [...prev];
      const existingIndex = newPermissions.findIndex(
        (p) => p.menu_id === Number(menuId) && p.role_id === selectedRole,
      );

      const key =
        `can_${type}` as keyof IMenuRolePermission;

      if (existingIndex !== -1) {
        newPermissions[existingIndex] = {
          ...newPermissions[existingIndex],
          [key]: value,
        };
      } else {
        newPermissions.push({
          menu_id: Number(menuId),
          role_id: selectedRole,
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
            (p) => p.menu_id === Number(child.id) && p.role_id === selectedRole,
          );
          if (childIndex !== -1) {
            newPermissions[childIndex] = {
              ...newPermissions[childIndex],
              [key]: value,
            };
          } else {
            newPermissions.push({
              menu_id: Number(child.id),
              role_id: selectedRole,
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
    if (selectedApplication) {
      loadRolesAndMenus(selectedApplication);
      setHasChanges(false);
    }
  };

  const grantAllPermissions = () => {
    if (!selectedRole) return;
    
    setHasChanges(true);
    const allPermissions: IMenuRolePermission[] = [];
    menuItems.forEach((menu) => {
      allPermissions.push({
        menu_id: Number(menu.id),
        role_id: selectedRole,
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
      });
      menu.children?.forEach((child) => {
        allPermissions.push({
          menu_id: Number(child.id),
          role_id: selectedRole,
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
    if (!selectedRole) return;
    
    setHasChanges(true);
    setPermissions((prev) => prev.filter((p) => p.role_id !== selectedRole));
  };

  // Stats
  const stats = useMemo(() => {
    if (!selectedRole) {
      return { totalMenus: 0, viewCount: 0, createCount: 0, editCount: 0, deleteCount: 0 };
    }
    
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

        {/* Application Selector */}
        <div className='bg-card rounded-xl border border-border p-4'>
          <label className='text-sm font-medium text-muted-foreground mb-2 block'>
            Seleccionar Aplicación
          </label>
          {isLoadingApps ? (
            <div className='flex items-center gap-2 text-muted-foreground'>
              <div className='w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin' />
              Cargando aplicaciones...
            </div>
          ) : (
            <select
              value={selectedApplication || ''}
              onChange={(e) => handleApplicationChange(Number(e.target.value))}
              className='w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50'
              disabled={applications.length === 0}>
                <option value=''>Seleccione</option>
                {applications.map((app) => (
                  <option key={app.id_application} value={app.id_application}>
                    {app.name}
                  </option>
                ))}
            </select>
          )}
        </div>

        {/* Role Selector */}
        <div className='bg-card rounded-xl border border-border p-4'>
          <div className='flex flex-col md:flex-row md:items-center gap-4'>
            <div className='flex-1'>
              <label className='text-sm font-medium text-muted-foreground mb-2 block'>
                Seleccionar Rol
              </label>
              {isLoadingRoles ? (
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <div className='w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin' />
                  Cargando roles...
                </div>
              ) : roles.length === 0 ? (
                <p className='text-sm text-muted-foreground'>No hay roles disponibles para esta aplicación</p>
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
            {selectedRoleData && (
              <div className='border-l border-border pl-4 hidden md:block'>
                <p className='text-sm text-muted-foreground'>Rol seleccionado</p>
                <p className='font-medium text-foreground'>
                  {selectedRoleData.name}
                </p>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  {selectedRoleData.description}
                </p>
              </div>
            )}
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
            {isLoadingMenus ? (
              <div className='flex items-center justify-center py-12 text-muted-foreground'>
                <div className='flex flex-col items-center gap-3'>
                  <div className='w-8 h-8 border-4 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin' />
                  <p>Cargando menús...</p>
                </div>
              </div>
            ) : menuItems.length === 0 ? (
              <div className='flex items-center justify-center py-12 text-muted-foreground'>
                <p>No hay menús disponibles para esta aplicación</p>
              </div>
            ) : !selectedRole ? (
              <div className='flex items-center justify-center py-12 text-muted-foreground'>
                <p>Selecciona un rol para gestionar permisos</p>
              </div>
            ) : (
              menuItems.map((menu) => (
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
              ))
            )}
          </div>

          {/* Footer */}
          <div className='flex items-center justify-between p-4 border-t border-border bg-secondary/30'>
            <p className='text-sm text-muted-foreground'>
              {selectedRoleData ? (
                <>
                  {stats.viewCount +
                    stats.createCount +
                    stats.editCount +
                    stats.deleteCount}{" "}
                  permisos asignados para{" "}
                  <span className='font-medium text-foreground'>
                    {selectedRoleData.name}
                  </span>
                </>
              ) : (
                'Selecciona un rol para ver los permisos'
              )}
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
