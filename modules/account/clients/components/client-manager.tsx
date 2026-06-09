/** @format */

"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import { RegisterClient } from "./form";
import { EmptyState } from "../scenes/empty-state";
import {
  HiOutlineUserCircle,
  HiOutlinePlusCircle,
  HiOutlineUsers,
  HiOutlinePencil,
  HiOutlineBuildingOffice2,
  HiOutlineChartBar,
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

interface IClientManagerProps {
  initialData: IClient[];
  initialUsers?: IUser[];
  userCompanies?: ICompany[];
}

export const ClientManager = ({
  initialData,
  initialUsers = [],
  userCompanies = [],
}: IClientManagerProps) => {
  const t = useTranslations("account.clients");
  const tCommon = useTranslations("common");

  const [openModal, setOpenModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [editingClient, setEditingClient] = useState<IClient | null>(null);
  const [users, setUsers] = useState<IUser[]>(initialUsers);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    userCompanies.length > 0 ? userCompanies[0].id_company : null
  );

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
      (client) => client.status === "active",
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

  const handleEdit = (row: IClient) => {
    setEditingClient(row);
    setOpenDetailModal(true);
  };

  // Calcular usuarios por cliente
  const getUserCountByClient = (clientId: number) => {
    return users.filter((user) => user.client_id === clientId).length;
  };

  const columns: ColumnDef<IClient>[] = useMemo(
    () => [
      {
        accessorKey: "first_name",
        header: t("fields.name"),
        cell: (info) => {
          const client = info.row.original;
          const fullName =
            `${client.first_name} ${client.second_name || ""} ${client.first_last_name} ${client.second_last_name || ""}`.trim();
          const userCount = getUserCountByClient(client.id_client!);
          return (
            <div className='flex flex-col'>
              <span className='font-semibold text-foreground'>{fullName}</span>
              <span className='text-xs text-muted-foreground'>
                {client.type_id}: {client.card_id} • {userCount}{" "}
                {userCount === 1 ? "usuario" : "usuarios"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "sex",
        header: "Sexo",
        cell: (info) => (
          <span className='text-sm'>{info.getValue<string>() || "-"}</span>
        ),
      },
      {
        accessorKey: "gender",
        header: "Género",
        cell: (info) => (
          <span className='text-sm'>{info.getValue<string>() || "-"}</span>
        ),
      },
      {
        accessorKey: "card_id",
        header: "Identificación",
        cell: (info) => {
          const client = info.row.original;
          return (
            <span className='text-sm'>
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
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-1.5'>
                <HiOutlineUsers className='h-4 w-4 text-muted-foreground' />
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    userCount > 0
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}>
                  {userCount}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        header: tCommon("status"),
        accessorKey: "status",
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              row.original.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}>
            {row.original.status === "active"
              ? tCommon("active")
              : tCommon("inactive")}
          </span>
        ),
      },
      {
        id: "actions",
        header: tCommon("actions"),
        cell: ({ row }) => {
          const client = row.original;
          const userCount = getUserCountByClient(client.id_client!);

          return (
            <div className='flex items-center gap-2'>
              <Buttons
                size='sm'
                variant='outline'
                className='inline-flex items-center gap-1.5'
                onClick={() => handleEdit(client)}>
                <HiOutlinePencil className='h-3.5 w-3.5' />
                Editar
              </Buttons>

              <Buttons
                size='sm'
                variant={userCount > 0 ? "default" : "outline"}
                className='inline-flex items-center gap-1.5'
                onClick={() => handleEdit(client)}>
                <HiOutlineUsers className='h-3.5 w-3.5' />
                {userCount > 0 ? `Ver ${userCount}` : "Agregar"}
              </Buttons>
            </div>
          );
        },
      },
    ],
    [t, tCommon, handleEdit, getUserCountByClient, users],
  );

  const summaryCards = [
    {
      icon: HiOutlineUserCircle,
      label: "Total Clientes",
      value: metrics.totalClients,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950",
    },
    {
      icon: HiOutlineChartBar,
      label: "Clientes Activos",
      value: metrics.activeClients,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950",
    },
    {
      icon: HiOutlineUsers,
      label: "Total Usuarios",
      value: metrics.totalUsers,
      gradient: "from-violet-500 to-purple-500",
      bgGradient: "from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950",
    },
    {
      icon: HiOutlineUsers,
      label: "Usuarios Activos",
      value: metrics.activeUsers,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950",
    },
  ];

  return (
    <section className='mx-auto flex w-full flex-col gap-6 px-6'>
      <article className='rounded-2xl border border-border/40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-8 shadow-2xl dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
        <header className='space-y-5'>
          <div className='flex items-start justify-between'>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500'>
                  <HiOutlineBuildingOffice2 className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold text-white'>
                    Gestión Empresarial
                  </h1>
                  <p className='text-sm text-slate-300'>Administra clientes y usuarios por empresa</p>
                </div>
              </div>
            </div>
            <Buttons
              className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl'
              onClick={() => setOpenModal(true)}>
              <HiOutlinePlusCircle className='h-4 w-4' />
              Nuevo Cliente
            </Buttons>
          </div>

          <div className='pt-2'>
            <CompanySelector
              companies={userCompanies}
              selectedCompanyId={selectedCompanyId}
              onCompanyChange={setSelectedCompanyId}
            />
          </div>
        </header>
      </article>

      {filteredClients.length > 0 ? (
        <>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${card.bgGradient} p-6 shadow-sm transition-all hover:shadow-md`}>
                <div className='absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 opacity-10'>
                  <div className={`h-full w-full rounded-full bg-gradient-to-br ${card.gradient}`} />
                </div>
                <div className='relative'>
                  <div className='flex items-center justify-between'>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient}`}>
                      <card.icon className='h-5 w-5 text-white' />
                    </div>
                  </div>
                  <p className='mt-4 text-sm font-medium text-muted-foreground'>
                    {card.label}
                  </p>
                  <p className='mt-1 text-3xl font-bold text-foreground'>
                    {card.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className='rounded-2xl border border-border bg-card shadow-sm'>
            <DataTable data={filteredClients} columns={columns} />
          </div>
        </>
      ) : (
        <EmptyState onCreateClick={() => setOpenModal(true)} />
      )}

      <Modal
        size='lg'
        title='Crear Nuevo Cliente'
        open={openModal}
        onOpenChange={() => setOpenModal(!openModal)}>
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
