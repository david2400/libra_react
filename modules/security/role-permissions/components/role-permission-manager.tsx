/** @format */

"use client";

import { useState, useMemo } from "react";
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
import type { MenuItem } from "../models/menu-permission.interface";
import { menuItems, roles, initialPermissions } from "../mocks/data";
import { PermissionType } from "@/modules/security/permissions/models/permission.interface";
import { IPermission } from "@/server/domains/access-control/security/permissions";

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
  permissions: IPermission[];
  selectedRole: string;
  onPermissionChange: (
    menuId: string,
    type: PermissionType,
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
    (p) => p.menuId === menu.id && p.roleId === selectedRole,
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
    type: PermissionType,
  ): "all" | "none" | "some" => {
    if (!menu.children) return "none";
    const childPerms = menu.children
      .map((child) =>
        permissions.find(
          (p) => p.menu_ === child.id && p.roleId === selectedRole,
        ),
      )
      .filter(Boolean);

    if (childPerms.length === 0) return "none";

    const key =
      `can${type.charAt(0).toUpperCase()}${type.slice(1)}` as keyof IPermission;
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
          {(["view", "create", "edit", "delete"] as PermissionType[]).map(
            (type) => {
              const key =
                `can${type.charAt(0).toUpperCase()}${type.slice(1)}` as keyof IPermission;
              const checked = permission ? (permission[key] as boolean) : false;
              const childState = hasChildren
                ? getChildrenPermissionState(type)
                : "none";
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

export function MenuPermissionsManager() {
  const [permissions, setPermissions] =
    useState<IPermission[]>(initialPermissions);
  const [selectedRole, setSelectedRole] = useState(roles[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(menuItems.map((m) => m.id)),
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedRoleData = roles.find((r) => r.id === selectedRole)!;

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
    type: PermissionType,
    value: boolean,
  ) => {
    setHasChanges(true);
    setPermissions((prev) => {
      const newPermissions = [...prev];
      const existingIndex = newPermissions.findIndex(
        (p) => p.menuId === menuId && p.role_id === selectedRole,
      );

      const key =
        `can${type.charAt(0).toUpperCase()}${type.slice(1)}` as keyof IPermission;

      if (existingIndex !== -1) {
        newPermissions[existingIndex] = {
          ...newPermissions[existingIndex],
          [key]: value,
        };
      } else {
        newPermissions.push({
          menuId,
          roleId: selectedRole,
          canView: type === "view" ? value : false,
          canCreate: type === "create" ? value : false,
          canEdit: type === "edit" ? value : false,
          canDelete: type === "delete" ? value : false,
        });
      }

      // If parent, update all children
      const parentMenu = menuItems.find((m) => m.id === menuId);
      if (parentMenu?.children) {
        parentMenu.children.forEach((child) => {
          const childIndex = newPermissions.findIndex(
            (p) => p.menuId === child.id && p.roleId === selectedRole,
          );
          if (childIndex !== -1) {
            newPermissions[childIndex] = {
              ...newPermissions[childIndex],
              [key]: value,
            };
          } else {
            newPermissions.push({
              menuId: child.id,
              roleId: selectedRole,
              canView: type === "view" ? value : false,
              canCreate: type === "create" ? value : false,
              canEdit: type === "edit" ? value : false,
              canDelete: type === "delete" ? value : false,
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
    const allPermissions: IPermission[] = [];
    menuItems.forEach((menu) => {
      allPermissions.push({
        menuId: menu.id,
        roleId: selectedRole,
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
      });
      menu.children?.forEach((child) => {
        allPermissions.push({
          menuId: child.id,
          roleId: selectedRole,
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
        });
      });
    });
    setPermissions((prev) => {
      const otherRoles = prev.filter((p) => p.roleId !== selectedRole);
      return [...otherRoles, ...allPermissions];
    });
  };

  const revokeAllPermissions = () => {
    setHasChanges(true);
    setPermissions((prev) => prev.filter((p) => p.roleId !== selectedRole));
  };

  // Stats
  const stats = useMemo(() => {
    const rolePermissions = permissions.filter(
      (p) => p.roleId === selectedRole,
    );
    const totalMenus = menuItems.reduce(
      (acc, m) => acc + 1 + (m.children?.length || 0),
      0,
    );
    const viewCount = rolePermissions.filter((p) => p.canView).length;
    const createCount = rolePermissions.filter((p) => p.canCreate).length;
    const editCount = rolePermissions.filter((p) => p.canEdit).length;
    const deleteCount = rolePermissions.filter((p) => p.canDelete).length;

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

        {/* Role Selector */}
        <div className='bg-card rounded-xl border border-border p-4'>
          <div className='flex flex-col md:flex-row md:items-center gap-4'>
            <div className='flex-1'>
              <label className='text-sm font-medium text-muted-foreground mb-2 block'>
                Seleccionar Rol
              </label>
              <div className='flex flex-wrap gap-2'>
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      selectedRole === role.id
                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                        : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                    }`}>
                    <span
                      className='w-3 h-3 rounded-full'
                      style={{ backgroundColor: role.color }}
                    />
                    <span className='font-medium'>{role.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className='border-l border-border pl-4 hidden md:block'>
              <p className='text-sm text-muted-foreground'>Rol seleccionado</p>
              <p className='font-medium text-foreground'>
                {selectedRoleData.name}
              </p>
              <p className='text-xs text-muted-foreground mt-0.5'>
                {selectedRoleData.description}
              </p>
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
                {selectedRoleData.name}
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
