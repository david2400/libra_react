/** @format */

"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import { RegisterUser, UpdateUser } from "./form";
import { HiOutlineUser, HiOutlinePlusCircle } from "react-icons/hi2";
import { DataTable } from "@repo/ui/table/scenes";
import { IUser } from "../models/user.interface";

interface IUserManagerProps {
  initialData: IUser[];
}

export const UserManager = ({ initialData }: IUserManagerProps) => {
  const t = useTranslations("account.users");
  const tActions = useTranslations("actions");

  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);

  const metrics = useMemo(() => {
    const activeUsers = initialData.filter((user) => user.deleted !== false).length;
    const uniqueCompanies = new Set(initialData.map(u => u.company_id).filter(Boolean)).size;

    return {
      totalUsers: initialData.length,
      activeUsers,
      uniqueCompanies,
    };
  }, [initialData]);

  const handleEdit = (row: IUser) => {
    setEditingUser(row);
    setOpenModalUpdate(true);
  };

  const columns: ColumnDef<IUser>[] = useMemo(
    () => [
      {
        accessorKey: "username",
        header: t("fields.username"),
        cell: (info) => (
          <span className='font-semibold text-foreground'>{info.getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "status",
        header: t("fields.status"),
        cell: (info) => (
          <span className='text-sm'>{info.getValue<string>() || "active"}</span>
        ),
      },
      {
        accessorKey: "companyId",
        header: "Empresa",
        cell: (info) => (
          <span className='text-sm'>{info.getValue<number>() || "-"}</span>
        ),
      },
      {
        header: "Estado",
        accessorKey: "deleted",
        cell: ({ row }) => (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.original.deleted !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {row.original.deleted !== false ? "Activo" : "Inactivo"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <Buttons size='sm' variant='outline' onClick={() => handleEdit(row.original)}>
            Editar
          </Buttons>
        ),
      },
    ],
    [t, handleEdit],
  );

  const summaryCards = [
    {
      icon: HiOutlineUser,
      label: "Total de usuarios",
      value: metrics.totalUsers,
      accent: "from-emerald-500/40 to-green-500/40 text-emerald-700",
    },
    {
      icon: HiOutlineUser,
      label: "Usuarios activos",
      value: metrics.activeUsers,
      accent: "from-teal-500/40 to-cyan-500/40 text-teal-700",
    },
    {
      icon: HiOutlineUser,
      label: "Empresas únicas",
      value: metrics.uniqueCompanies,
      accent: "from-amber-500/40 to-orange-500/40 text-amber-700",
    },
  ];

  return (
    <section className='mx-auto flex w-full flex-col gap-6 px-6'>
      <article className='rounded-3xl border border-border/40 bg-gradient-to-br from-emerald-600 via-green-500 to-teal-500 px-8 py-10 text-white shadow-2xl'>
        <header className='space-y-4'>
          <span className='inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/75'>
            {t("title")}
          </span>
          <div className='space-y-2'>
            <h1 className='text-4xl font-semibold leading-tight'>{t("description")}</h1>
            <p className='text-white/80'>Gestiona los usuarios del sistema y sus accesos.</p>
          </div>
          <Buttons
            color='success'
            className='inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-white'
            onClick={() => setOpenModal(true)}>
            <HiOutlinePlusCircle className='h-4 w-4' />
            {tActions("saveUser")}
          </Buttons>
        </header>
      </article>

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

      <Modal size='lg' title="Crear usuario" open={openModal} onOpenChange={() => setOpenModal(!openModal)}>
        <RegisterUser />
      </Modal>

      <Modal size='lg' open={openModalUpdate} onOpenChange={() => setOpenModalUpdate(!openModalUpdate)} title={t("modal.edit_title")} showCloseButton={true} hideDefaultFooter={true}>
        <UpdateUser initialValues={editingUser} handleClose={() => setOpenModalUpdate(false)} />
      </Modal>
    </section>
  );
};
