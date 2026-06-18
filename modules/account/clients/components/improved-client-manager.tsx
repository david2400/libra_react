/** @format */

"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import { RegisterClient } from "./form";
import {
  HiOutlineUserCircle,
  HiOutlinePlusCircle,
  HiOutlineUsers,
  HiOutlinePencil,
  HiOutlineBuildingOffice2,
  HiOutlineChartBar,
  HiOutlineMagnifyingGlass,
  HiOutlineEllipsisVertical,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineTrash,
  HiOutlineArrowPath,
  HiOutlineEye,
} from "react-icons/hi2";
import { DataTable } from "@repo/ui/table/scenes";
import { IClient } from "../models/client.interface";
import { IUser } from "@/modules/account/users/models/user.interface";
import { CompanySelector } from "./company-selector";
import { ClientDetailModal } from "./client-detail-modal";

interface ICompany {
  id_company: number;
  name: string;
  nit: string;
  status: string;
}

interface IImprovedClientManagerProps {
  initialData: IClient[];
  initialUsers?: IUser[];
  userCompanies?: ICompany[];
}

const StatusBadge = ({ status }: { status: string }) => {
  const isActive = status === "active" || status === "Activo";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isActive
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

const ClientAvatar = ({ client }: { client: IClient }) => {
  const firstName = client.first_name || "";
  const lastName = client.first_last_name || "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white font-medium text-sm">
      {initials || "CL"}
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

export const ImprovedClientManager = ({
  initialData,
  initialUsers = [],
  userCompanies = [],
}: IImprovedClientManagerProps) => {
  const t = useTranslations("account.clients");
  const tCommon = useTranslations("common");

  const [openModal, setOpenModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [editingClient, setEditingClient] = useState<IClient | null>(null);
  const [users, setUsers] = useState<IUser[]>(initialUsers);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    userCompanies.length > 0 ? userCompanies[0].id_company : null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userCompanies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(userCompanies[0].id_company);
    }
  }, [userCompanies, selectedCompanyId]);

  const filteredClients = useMemo(() => {
    return initialData;
  }, [initialData]);

  const filteredUsers = useMemo(() => {
    if (!selectedCompanyId) return users;
    return users.filter((user) => user.company_id === selectedCompanyId);
  }, [users, selectedCompanyId]);

  const metrics = useMemo(() => {
    const activeClients = filteredClients.filter(
      (client) => client.status === "active" || client.status === "Activo",
    ).length;
    const totalUsers = filteredUsers.length;
    const activeUsers = filteredUsers.filter((u) => u.status === "active").length;

    return {
      totalClients: filteredClients.length,
      activeClients,
      totalUsers,
      activeUsers,
    };
  }, [filteredClients, filteredUsers]);

  const handleEdit = useCallback((row: IClient) => {
    setEditingClient(row);
    setOpenDetailModal(true);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

  // Calculate users per client
  const getUserCountByClient = useCallback((clientId: number) => {
    return users.filter((user) => user.client_id === clientId).length;
  }, [users]);

  // Filter clients based on search and tab
  const displayClients = useMemo(() => {
    let filtered = filteredClients;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(client => {
        const fullName = `${client.first_name} ${client.first_last_name}`.toLowerCase();
        const cardId = `${client.type_id} ${client.card_id}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || 
               cardId.includes(searchTerm.toLowerCase());
      });
    }

    // Apply tab filter
    if (selectedTab === "active") {
      filtered = filtered.filter(client => client.status === "active" || client.status === "Activo");
    } else if (selectedTab === "inactive") {
      filtered = filtered.filter(client => client.status !== "active" && client.status !== "Activo");
    }

    return filtered;
  }, [filteredClients, searchTerm, selectedTab]);

  const columns: ColumnDef<IClient>[] = useMemo(
    () => [
      {
        accessorKey: "first_name",
        header: "Cliente",
        cell: (info) => {
          const client = info.row.original;
          const fullName = `${client.first_name} ${client.second_name || ""} ${client.first_last_name} ${client.second_last_name || ""}`.trim();
          const userCount = getUserCountByClient(client.id_client!);
          return (
            <div className="flex items-center gap-3">
              <ClientAvatar client={client} />
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">{fullName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {client.type_id}: {client.card_id} • {userCount} {userCount === 1 ? "usuario" : "usuarios"}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "sex",
        header: "Sexo",
        cell: (info) => (
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {info.getValue<string>() || "-"}
          </span>
        ),
      },
      {
        accessorKey: "gender",
        header: "Género",
        cell: (info) => (
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {info.getValue<string>() || "-"}
          </span>
        ),
      },
      {
        accessorKey: "card_id",
        header: "Identificación",
        cell: (info) => {
          const client = info.row.original;
          return (
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {client.type_id}: {info.getValue<string>()}
            </span>
          );
        },
      },
      {
        header: "Usuarios",
        accessorKey: "id_client",
        cell: ({ row }) => {
          const client = row.original;
          const userCount = getUserCountByClient(client.id_client!);
          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <HiOutlineUsers className="h-4 w-4 text-slate-400" />
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    userCount > 0
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                >
                  {userCount}
                </span>
              </div>
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
          const client = row.original;
          const userCount = getUserCountByClient(client.id_client!);

          return (
            <div className="flex items-center gap-2">
              <Buttons
                size="sm"
                variant="outline"
                onClick={() => handleEdit(client)}
                className="inline-flex items-center gap-1.5"
              >
                <HiOutlinePencil className="h-3.5 w-3.5" />
                Editar
              </Buttons>

              <Buttons
                size="sm"
                variant={userCount > 0 ? "default" : "outline"}
                onClick={() => handleEdit(client)}
                className="inline-flex items-center gap-1.5"
              >
                <HiOutlineEye className="h-3.5 w-3.5" />
                {userCount > 0 ? `Ver ${userCount}` : "Agregar"}
              </Buttons>
            </div>
          );
        },
      },
    ],
    [handleEdit, getUserCountByClient, users],
  );

  const tabCounts = useMemo(() => ({
    all: filteredClients.length,
    active: filteredClients.filter(c => c.status === "active" || c.status === "Activo").length,
    inactive: filteredClients.filter(c => c.status !== "active" && c.status !== "Activo").length,
  }), [filteredClients]);

  const summaryCards = [
    {
      icon: HiOutlineUserCircle,
      label: "Total Clientes",
      value: metrics.totalClients,
      change: 8,
      trend: "up" as const,
    },
    {
      icon: HiOutlineChartBar,
      label: "Clientes Activos",
      value: metrics.activeClients,
      change: 12,
      trend: "up" as const,
    },
    {
      icon: HiOutlineUsers,
      label: "Total Usuarios",
      value: metrics.totalUsers,
      change: 5,
      trend: "up" as const,
    },
    {
      icon: HiOutlineUsers,
      label: "Usuarios Activos",
      value: metrics.activeUsers,
      change: -2,
      trend: "down" as const,
    },
  ];

  return (
    <section className="mx-auto flex w-full flex-col gap-6 px-6">
      {/* Header */}
      <header className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-8 shadow-2xl dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <HiOutlineBuildingOffice2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Gestión Empresarial</h1>
                <p className="text-sm text-slate-300">Administra clientes y usuarios por empresa</p>
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
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
              onClick={() => setOpenModal(true)}
            >
              <HiOutlinePlusCircle className="h-4 w-4" />
              Nuevo Cliente
            </Buttons>
          </div>
        </div>

        <div className="pt-2">
          <CompanySelector
            companies={userCompanies}
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={setSelectedCompanyId}
          />
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <StatsCard
            key={card.label}
            title={card.label}
            value={card.value}
            change={card.change}
            icon={card.icon}
            trend={card.trend}
          />
        ))}
      </div>

      {/* Filters Section */}
      <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Filtros y Búsqueda</h2>
            <p className="text-sm text-muted-foreground">Encuentra clientes rápidamente usando los filtros disponibles</p>
          </div>

          {/* Search */}
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o identificación..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            {[
              { key: "all", label: `Todos (${tabCounts.all})` },
              { key: "active", label: `Activos (${tabCounts.active})` },
              { key: "inactive", label: `Inactivos (${tabCounts.inactive})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === tab.key
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
            <h2 className="text-lg font-semibold text-foreground">Clientes</h2>
            <div className="text-sm text-muted-foreground">
              Mostrando {displayClients.length} de {filteredClients.length} clientes
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
          ) : displayClients.length > 0 ? (
            <DataTable data={displayClients} columns={columns} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <HiOutlineUserCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No se encontraron clientes
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm
                  ? "Intenta ajustar la búsqueda"
                  : "Crea un nuevo cliente para comenzar"}
              </p>
              {!searchTerm && (
                <Buttons onClick={() => setOpenModal(true)}>
                  <HiOutlinePlusCircle className="h-4 w-4 mr-2" />
                  Crear primer cliente
                </Buttons>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal
        size="lg"
        title="Crear Nuevo Cliente"
        open={openModal}
        onOpenChange={() => setOpenModal(!openModal)}
      >
        <RegisterClient />
      </Modal>

      <ClientDetailModal
        client={editingClient}
        open={openDetailModal}
        onClose={() => {
          setOpenDetailModal(false);
          setEditingClient(null);
        }}
        initialUsers={filteredUsers.filter(
          (u) => u.client_id === editingClient?.id_client
        )}
        onUserCreated={(user: IUser) => {
          setUsers((prev) => [...prev, user]);
        }}
        onUserUpdated={(user: IUser) => {
          setUsers((prev) =>
            prev.map((u) => (u.id_user === user.id_user ? user : u))
          );
        }}
        onUserDeleted={(userId: number) => {
          setUsers((prev) => prev.filter((u) => u.id_user !== userId));
        }}
      />
    </section>
  );
};
