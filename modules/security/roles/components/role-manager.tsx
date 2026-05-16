/** @format */

"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import { RegisterRole, UpdateRole } from "./form";
import { HiOutlineShieldCheck, HiOutlinePlusCircle } from "react-icons/hi2";
import { DataTable } from "@repo/ui/table/scenes";
import { IRole } from "../models/role.interface";

interface IRoleManagerProps {
  initialData: IRole[];
}

export const RoleManager = ({ initialData }: IRoleManagerProps) => {
  const t = useTranslations("security.roles");
  const tOptions = useTranslations("options");
  const tActions = useTranslations("actions");

  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingRole, setEditingRole] = useState<IRole | null>(null);

  const metrics = useMemo(() => {
    const activeRoles = initialData.filter((role) => role.deleted !== false).length;
    // const totalPermissions = initialData.reduce((acc, role) => acc + (role.permissions?.length || 0), 0);

    return {
      totalRoles: initialData.length,
      activeRoles,
      // totalPermissions,
    };
  }, [initialData]);

  const handleEdit = (row: IRole) => {
    setEditingRole(row);
    handleModalCloseEdit();
  };

  const handleModalCloseEdit = () => {
    setOpenModalUpdate((prev) => !prev);
  };

  const handleModalClose = () => {
    setOpenModal((prev) => !prev);
  };

  const columns: ColumnDef<IRole>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: t("fields.name"),
        cell: (info) => (
          <div className='flex flex-col'>
            <span className='font-semibold text-foreground'>
              {info.row.original.name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: t("fields.description"),
        cell: (info) => (
          <span className='text-sm'>{info.getValue<string>() || "-"}</span>
        ),
      },
      // {
      //   accessorKey: "permissions",
      //   header: "Permisos",
      //   cell: ({ row }) => (
      //     <span className='text-sm'>
      //       {row.original.permissions?.length || 0} permisos
      //     </span>
      //   ),
      // },
      {
        header: "Status",
        accessorKey: "deleted",
        cell: ({ row }) => (
          <div className='flex items-center'>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                row.original.deleted == false
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}>
              {row.original.deleted == false ? "Active" : "Inactive"}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className='flex gap-2'>
            <Buttons
              size='sm'
              variant='outline'
              onClick={() => handleEdit(row.original)}>
              Editar
            </Buttons>
            <Buttons size='sm' variant='ghost'>
              Histórico
            </Buttons>
          </div>
        ),
      },
    ],
    [t, tOptions, handleEdit],
  );

  const summaryCards = [
    {
      icon: HiOutlineShieldCheck,
      label: "Total de roles",
      value: metrics.totalRoles,
      accent: "from-indigo-500/40 to-violet-500/40 text-indigo-700",
    },
    {
      icon: HiOutlineShieldCheck,
      label: "Roles activos",
      value: metrics.activeRoles,
      accent: "from-emerald-500/40 to-teal-500/40 text-emerald-700",
    },
    // {
    //   icon: HiOutlineShieldCheck,
    //   label: "Total permisos",
    //   value: metrics.totalPermissions,
    //   accent: "from-amber-500/40 to-orange-500/40 text-amber-700",
    // },
  ];

  return (
    <section className='mx-auto flex w-full flex-col gap-6 px-6'>
      <article className='rounded-3xl border border-border/40 bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-500 px-8 py-10 text-white shadow-2xl'>
        <header className='space-y-4'>
          <span className='inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/75'>
            {t("title")}
          </span>
          <div className='space-y-2'>
            <h1 className='text-4xl font-semibold leading-tight'>
              {t("description")}
            </h1>
            <p className='text-white/80'>
              Gestiona los roles del sistema y sus permisos asociados.
            </p>
          </div>
          <Buttons
            color='success'
            className='inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-white'
            onClick={() => setOpenModal(true)}>
            <HiOutlinePlusCircle className='h-4 w-4' />
            {tActions("saveRole")}
          </Buttons>
        </header>
      </article>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border border-border/40 bg-gradient-to-br ${card.accent} px-5 py-4 shadow-sm backdrop-blur`}>
            <div className='flex items-center justify-between text-sm font-semibold text-white/80'>
              <span>{card.label}</span>
              <card.icon className='h-5 w-5 text-white/70' />
            </div>
            <p className='mt-2 text-2xl font-semibold text-white'>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <DataTable
        data={initialData}
        columns={columns}
        className='py-2'
      />

      <Modal
        size='lg'
        title={editingRole ? "Editar rol" : "Crear rol"}
        open={openModal}
        onOpenChange={handleModalClose}>
        <RegisterRole />
      </Modal>

      <Modal
        size='lg'
        open={openModalUpdate}
        onOpenChange={handleModalCloseEdit}
        title={t("modal.edit_title")}
        description={t("modal.edit_description")}
        showCloseButton={true}
        hideDefaultFooter={true}>
        <UpdateRole
          initialValues={editingRole}
          handleClose={handleModalCloseEdit}
        />
      </Modal>
    </section>
  );
};
