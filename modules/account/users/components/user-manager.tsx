/** @format */

"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import { RegisterUser, UpdateUser } from "./form";
import {
  HiOutlineUser,
  HiOutlinePlusCircle,
  HiOutlineUsers,
  HiOutlineBuildingOffice2,
  HiOutlineChartBar,
  HiOutlinePencil,
  HiOutlineMagnifyingGlass,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineArrowPath,
  HiOutlineUserCircle,
  HiOutlineEye,
  HiOutlineLink,
} from "react-icons/hi2";
import { DataTable } from "@repo/ui/table/scenes";
import { IUser } from "../models/user.interface";
import { useUsers } from "../hooks/use-users";
import { IClient } from "@/server/domains/access-control/account/clients";
import { ICompany } from "@/server/domains/access-control/account/companies";


interface IEnhancedUserManagerV2Props {
  initialData: IUser[];
  companies?: ICompany[];
  clients?: IClient[];
}

const StatusBadge = ({ status }: { status: string }) => {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isActive
        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
        : "bg-slate-100 text-slate-700 border-slate-200"
        }`}
    >
      <div className="flex items-center gap-1.5">
        <div className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-600" : "bg-slate-500"}`} />
        {isActive ? "Activo" : "Inactivo"}
      </div>
    </span>
  );
};

const UserAvatar = ({ user }: { user: IUser }) => {
  const initials = user.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-medium text-sm">
      {initials}
    </div>
  );
};

const ClientChip = ({ client, onUnlink }: { client: IClient; onUnlink?: () => void }) => {
  const fullName = `${client.first_name} ${client.first_last_name}`.trim();
  const initials = `${client.first_name?.charAt(0)}${client.first_last_name?.charAt(0)}`.toUpperCase();

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-full">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-medium">
        {initials}
      </div>
      <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
        {fullName}
      </span>
      {onUnlink && (
        <button
          onClick={onUnlink}
          className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
        >
          <HiOutlineXMark className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

const StatsCard = ({
  title,
  value,
  change,
  icon: Icon,
  trend
}: {
  title: string;
  value: number | string;
  change?: number;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
}) => {
  const trendColors = {
    up: 'text-emerald-600 bg-emerald-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-slate-600 bg-slate-50'
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50 to-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 dark:from-slate-800 dark:to-slate-900">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
          {change !== undefined && (
            <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${trendColors[trend || 'neutral']}`}>
              {trend === 'up' && <Icon className="h-3 w-3 mr-1" />}
              {change > 0 ? '+' : ''}{change}%
            </div>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
          <Icon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
        </div>
      </div>
    </div>
  );
};

export const UserManager = ({
  initialData,
  companies = [],
  clients = []
}: IEnhancedUserManagerV2Props) => {
  const t = useTranslations("account.users");
  const tCommon = useTranslations("common");
  const tActions = useTranslations("actions");

  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedClientFilter, setSelectedClientFilter] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    filteredUsers,
    stats,
    getCompanyName,
    getClientName,
    updateUser,
    deleteUser,
    toggleUserStatus,
  } = useUsers({
    initialUsers: initialData,
    companies,
    clients,
  });

  const handleEdit = useCallback((row: IUser) => {
    console.log(row)
    setEditingUser(row);
    setOpenModalUpdate(true);
  }, []);

  const handleDelete = useCallback(async (userId: number) => {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        const { deleteUserAction } = await import(
          "@/server/domains/access-control/account/users/actions"
        );
        await deleteUserAction(userId);
        deleteUser(userId);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  }, [deleteUser]);

  const handleToggleStatus = useCallback((userId: number) => {
    toggleUserStatus(userId);
  }, [toggleUserStatus]);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

  // Enhanced filtering with client filter
  const displayUsers = useMemo(() => {
    let filtered = filteredUsers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCompanyName(user.company_id)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getClientName(user.client_id)?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply client filter
    if (selectedClientFilter) {
      filtered = filtered.filter(user => user.client_id === selectedClientFilter);
    }

    // Apply tab filter
    if (selectedTab === "active") {
      filtered = filtered.filter(user => user.status === "active");
    } else if (selectedTab === "inactive") {
      filtered = filtered.filter(user => user.status !== "active");
    } else if (selectedTab === "unassigned") {
      filtered = filtered.filter(user => !user.client_id);
    }

    return filtered;
  }, [filteredUsers, searchTerm, selectedClientFilter, selectedTab, getCompanyName, getClientName]);

  // Enhanced client data with user counts
  const clientsWithUserCounts = useMemo(() => {
    return clients.map(client => ({
      ...client,
      userCount: filteredUsers.filter(user => user.client_id === client.id_client).length
    }));
  }, [clients, filteredUsers]);

  const columns: ColumnDef<IUser>[] = useMemo(
    () => [
      {
        accessorKey: "username",
        header: "Usuario",
        cell: (info) => {
          const user = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <UserAvatar user={user} />
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">{user.username}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">ID: {user.id_user}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "company_id",
        header: "Empresa",
        cell: (info) => {
          const companyId = info.getValue<number>();
          const companyName = companyId && companyId !== undefined ? getCompanyName(companyId) : null;
          return (
            <div className="flex items-center gap-2">
              {companyName ? (
                <>
                  <HiOutlineBuildingOffice2 className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{companyName}</span>
                </>
              ) : (
                <span className="text-sm text-slate-400">-</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "client_id",
        header: "Cliente Asignado",
        cell: (info) => {
          const client = info.row.original.client;
          if (!client) {
            return (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center">
                  <HiOutlineUserCircle className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Sin asignar</p>
                  <p className="text-xs text-slate-400">Click para asignar</p>
                </div>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-medium">
                {`${client.first_name?.charAt(0)}${client.first_last_name?.charAt(0)}`.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {`${client.first_name} ${client.first_last_name}`.trim()}
                </p>
                <p className="text-xs text-slate-500">
                  {client.type_id}: {client.card_id}
                </p>
              </div>
              <HiOutlineLink className="h-4 w-4 text-purple-500" />
            </div>
          );
        },
      },
      {
        header: "Estado",
        accessorKey: "status",
        cell: ({ row }) => <StatusBadge status={row.original.status || "inactive"} />,
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
          const user = row.original;
          const hasClient = !!user.client_id;

          return (
            <div className="flex items-center gap-2">
              <Buttons
                size="sm"
                variant="outline"
                onClick={() => handleEdit(user)}
                className="inline-flex items-center gap-1.5"
              >
                <HiOutlinePencil className="h-3.5 w-3.5" />
                Editar
              </Buttons>

              <Buttons
                size="sm"
                variant="outline"
                className="inline-flex items-center gap-1.5"
              >
                <HiOutlineEye className="h-3.5 w-3.5" />
                {hasClient ? "Ver Cliente" : "Asignar"}
              </Buttons>

              <Buttons
                size="sm"
                variant={user.status === "active" ? "outline" : "default"}
                onClick={() => handleToggleStatus(user.id_user!)}
                className="inline-flex items-center gap-1.5"
              >
                {user.status === "active" ? (
                  <>
                    <HiOutlineXMark className="h-3.5 w-3.5" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <HiOutlineCheck className="h-3.5 w-3.5" />
                    Activar
                  </>
                )}
              </Buttons>
            </div>
          );
        },
      },
    ],
    [handleEdit, handleToggleStatus, clients, getCompanyName, getClientName],
  );

  const tabCounts = useMemo(() => ({
    all: filteredUsers.length,
    active: filteredUsers.filter(u => u.status === "active").length,
    inactive: filteredUsers.filter(u => u.status !== "active").length,
    unassigned: filteredUsers.filter(u => !u.client_id).length,
  }), [filteredUsers]);

  return (
    <section className="mx-auto flex w-full flex-col gap-6 px-6">
      {/* Header */}
      <header className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-8 shadow-2xl dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <HiOutlineUsers className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
                <p className="text-sm text-slate-300">Administra usuarios del sistema y sus asignaciones a clientes</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Buttons
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-white border-white/20 hover:bg-white/10"
            >
              <HiOutlineArrowPath className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Buttons>
            <Buttons
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
              onClick={() => setOpenModal(true)}
            >
              <HiOutlinePlusCircle className="h-4 w-4" />
              Nuevo Usuario
            </Buttons>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Usuarios"
          value={stats.total}
          icon={HiOutlineUsers}
          change={12}
          trend="up"
        />
        <StatsCard
          title="Usuarios Activos"
          value={stats.active}
          icon={HiOutlineChartBar}
          change={8}
          trend="up"
        />
        <StatsCard
          title="Usuarios Inactivos"
          value={stats.inactive}
          icon={HiOutlineUser}
          change={-3}
          trend="down"
        />
        <StatsCard
          title="Usuarios sin Asignar"
          value={tabCounts.unassigned}
          icon={HiOutlineUserCircle}
          change={-5}
          trend="down"
        />
      </div>

      {/* Enhanced Filters Section */}
      <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Filtros y Búsqueda</h2>
            <p className="text-sm text-muted-foreground">Encuentra usuarios rápidamente usando los filtros disponibles</p>
          </div>

          {/* Search */}
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, empresa o cliente..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          {/* Client Quick Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Filtrar por Cliente</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedClientFilter(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedClientFilter === null
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
              >
                Todos los clientes
              </button>
              {clientsWithUserCounts.map((client) => (
                <button
                  key={client.id_client}
                  onClick={() => setSelectedClientFilter(client.id_client!)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${selectedClientFilter === client.id_client
                    ? "bg-purple-100 text-purple-800 border-purple-200"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                    }`}
                >
                  <span>{`${client.first_name} ${client.first_last_name}`.trim()}</span>
                  {client.userCount > 0 && (
                    <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                      {client.userCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Tabs */}
          <div className="flex border-b border-border">
            {[
              { key: "all", label: `Todos (${tabCounts.all})` },
              { key: "active", label: `Activos (${tabCounts.active})` },
              { key: "inactive", label: `Inactivos (${tabCounts.inactive})` },
              { key: "unassigned", label: `Sin Asignar (${tabCounts.unassigned})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${selectedTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-border/40 bg-card shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Usuarios</h2>
            <div className="text-sm text-muted-foreground">
              Mostrando {displayUsers.length} de {filteredUsers.length} usuarios
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-muted rounded-lg animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-48 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-32 animate-pulse" />
                  </div>
                  <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : displayUsers.length > 0 ? (
            <DataTable data={displayUsers} columns={columns} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <HiOutlineUsers className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No se encontraron usuarios
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || selectedClientFilter || selectedTab !== "all"
                  ? "Intenta ajustar los filtros o la búsqueda"
                  : "Crea un nuevo usuario para comenzar"}
              </p>
              {!(searchTerm || selectedClientFilter || selectedTab !== "all") && (
                <Buttons onClick={() => setOpenModal(true)}>
                  <HiOutlinePlusCircle className="h-4 w-4 mr-2" />
                  Crear primer usuario
                </Buttons>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal size="lg" title="Crear usuario" open={openModal} onOpenChange={() => setOpenModal(!openModal)}>
        <RegisterUser />
      </Modal>

      <Modal
        size="lg"
        open={openModalUpdate}
        onOpenChange={() => setOpenModalUpdate(!openModalUpdate)}
        title={t("modal.edit_title")}
        showCloseButton={true}
        hideDefaultFooter={true}
      >
        <UpdateUser initialValues={editingUser} handleClose={() => setOpenModalUpdate(false)} />
      </Modal>
    </section>
  );
};
