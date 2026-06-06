/** @format */

"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import { RegisterClient } from "./form";
// import { ClientDetailModal } from "./client-detail-modal";
import { EmptyState } from "./empty-state";
import { HiOutlineUserCircle, HiOutlinePlusCircle } from "react-icons/hi2";
import { DataTable } from "@repo/ui/table/scenes";
import { IClient } from "../models/client.interface";
import { IUser } from "@/modules/account/users/models/user.interface";

interface IClientManagerProps {
  initialData: IClient[];
  initialUsers?: IUser[];
}

export const ClientManager = ({ initialData, initialUsers = [] }: IClientManagerProps) => {
  const t = useTranslations("account.clients");
  const tCommon = useTranslations("common");

  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingClient, setEditingClient] = useState<IClient | null>(null);
  const [users, setUsers] = useState<IUser[]>(initialUsers);

  const metrics = useMemo(() => {
    const activeClients = initialData.filter((client) => client.status === 'active').length;
    const uniqueGenders = new Set(initialData.map(c => c.gender).filter(Boolean)).size;
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;

    return {
      totalClients: initialData.length,
      activeClients,
      uniqueGenders,
      totalUsers,
      activeUsers,
    };
  }, [initialData, users]);

  const handleEdit = (row: IClient) => {
    setEditingClient(row);
    setOpenModalUpdate(true);
  };

  // Calcular usuarios por cliente
  const getUserCountByClient = (clientId: number) => {
    return users.filter(user => user.client_id === clientId).length;
  };

  const columns: ColumnDef<IClient>[] = useMemo(
    () => [
      {
        accessorKey: "first_name",
        header: t("fields.name"),
        cell: (info) => {
          const client = info.row.original;
          const fullName = `${client.first_name} ${client.second_name || ''} ${client.first_last_name} ${client.second_last_name || ''}`.trim();
          const userCount = getUserCountByClient(client.id_client!);
          return (
            <div className='flex flex-col'>
              <span className='font-semibold text-foreground'>{fullName}</span>
              <span className='text-xs text-muted-foreground'>
                {client.type_id}: {client.card_id} • {userCount} {userCount === 1 ? 'usuario' : 'usuarios'}
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
            <span className='text-sm'>{client.type_id}: {info.getValue<string>()}</span>
          );
        },
      },
      {
        header: tCommon("status"),
        accessorKey: "deleted",
        cell: ({ row }) => (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.original.deleted !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {row.original.deleted !== false ? tCommon("active") : tCommon("inactive")}
          </span>
        ),
      },
      {
        id: "actions",
        header: tCommon("actions"),
        cell: ({ row }) => (
          <Buttons size='sm' variant='outline' onClick={() => handleEdit(row.original)}>
            {tCommon("edit")}
          </Buttons>
        ),
      },
    ],
    [t, handleEdit],
  );

  const summaryCards = [
    {
      icon: HiOutlineUserCircle,
      label: "Total Clientes",
      value: metrics.totalClients,
      accent: "from-orange-500/40 to-amber-500/40 text-orange-700",
    },
    {
      icon: HiOutlineUserCircle,
      label: "Clientes Activos",
      value: metrics.activeClients,
      accent: "from-yellow-500/40 to-orange-500/40 text-yellow-700",
    },
    {
      icon: HiOutlineUserCircle,
      label: "Total Usuarios",
      value: metrics.totalUsers,
      accent: "from-amber-500/40 to-yellow-500/40 text-amber-700",
    },
    {
      icon: HiOutlineUserCircle,
      label: "Usuarios Activos",
      value: metrics.activeUsers,
      accent: "from-green-500/40 to-emerald-500/40 text-green-700",
    },
  ];

  return (
    <section className='mx-auto flex w-full flex-col gap-6 px-6'>
      <article className='rounded-3xl border border-border/40 bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-500 px-8 py-10 text-white shadow-2xl'>
        <header className='space-y-4'>
          <span className='inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/75'>
            {t("title")}
          </span>
          <div className='space-y-2'>
            <h1 className='text-4xl font-semibold leading-tight'>{t("description")}</h1>
            <p className='text-white/80'>{t("subtitle")}</p>
          </div>
          <Buttons
            color='success'
            className='inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-white'
            onClick={() => setOpenModal(true)}>
            <HiOutlinePlusCircle className='h-4 w-4' />
            {t("createButton")}
          </Buttons>
        </header>
      </article>

      {initialData.length > 0 ? (
        <>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {summaryCards.map((card) => (
              <div key={card.label} className={`rounded-2xl border border-border/40 bg-gradient-to-br ${card.accent} px-5 py-4 shadow-sm backdrop-blur`}>
                <div className='flex items-center justify-between text-sm font-semibold text-white/80'>
                  <span>{card.label}</span>
                  <card.icon className='h-5 w-5 text-white/70' />
                </div>
                <p className='mt-2 text-2xl font-semibold text-white'>{card.value}</p>
              </div>
            ))}
          </div>

          <DataTable data={initialData} columns={columns} className='py-2' />
        </>
      ) : (
        <EmptyState onCreateClick={() => setOpenModal(true)} />
      )}

      <Modal size='lg' title={t("modal.create_title")} open={openModal} onOpenChange={() => setOpenModal(!openModal)}>
        <RegisterClient />
      </Modal>

      {/* <ClientDetailModal
        client={editingClient}
        open={openModalUpdate}
        onClose={() => {
          setOpenModalUpdate(false);
          setEditingClient(null);
        }}
        initialUsers={users}
        onUserCreated={(user) => {
          setUsers(prev => [...prev, user]);
        }}
      /> */}
    </section>
  );
};
