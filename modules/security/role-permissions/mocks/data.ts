import type { MenuItem, MenuPermission } from "../models/menu-permission.interface";

export const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    path: "/dashboard",
    icon: "RiDashboardLine",
    children: [],
  },
  {
    id: "users",
    name: "Usuarios",
    path: "/users",
    icon: "RiUserLine",
    children: [
      {
        id: "users-list",
        name: "Lista de Usuarios",
        path: "/users/list",
        icon: "RiListUnordered",
      },
      {
        id: "users-roles",
        name: "Roles",
        path: "/users/roles",
        icon: "RiShieldUserLine",
      },
    ],
  },
  {
    id: "companies",
    name: "Empresas",
    path: "/companies",
    icon: "RiGroupLine",
    children: [],
  },
  {
    id: "clients",
    name: "Clientes",
    path: "/clients",
    icon: "RiShoppingBagLine",
    children: [],
  },
  {
    id: "reports",
    name: "Reportes",
    path: "/reports",
    icon: "RiBarChartLine",
    children: [
      {
        id: "reports-sales",
        name: "Ventas",
        path: "/reports/sales",
        icon: "RiLineChartLine",
      },
      {
        id: "reports-analytics",
        name: "Analíticas",
        path: "/reports/analytics",
        icon: "RiPieChartLine",
      },
    ],
  },
  {
    id: "settings",
    name: "Configuración",
    path: "/settings",
    icon: "RiSettingsLine",
    children: [],
  },
];

export const roles = [
  { id: "admin", name: "Administrador", description: "Acceso total al sistema", color: "#ef4444" },
  { id: "manager", name: "Gerente", description: "Acceso a gestión y reportes", color: "#f59e0b" },
  { id: "user", name: "Usuario", description: "Acceso limitado a operaciones básicas", color: "#10b981" },
];

export const initialPermissions: MenuPermission[] = [
  {
    menuId: "dashboard",
    roleId: "admin",
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  },
  {
    menuId: "users",
    roleId: "admin",
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
  },
];
