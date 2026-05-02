/** @format */

"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import { RegisterRolePermission, UpdateRolePermission } from "./form";
import { HiOutlineLockClosed, HiOutlinePlusCircle } from "react-icons/hi2";
import { DataTable } from "@repo/ui/table/scenes";
import { IRolePermission } from "../models/role-permission.interface";

interface IRolePermissionManagerProps {
  initialData: IRolePermission[];
}

export const RolePermissionManager = ({ initialData }: IRolePermissionManagerProps) => {
  const t = useTranslations("AccessControl.security.rolePermissions");
  const tActions = useTranslations("AccessControl.actions");

  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingRolePermission, setEditingRolePermission] = useState<IRolePermission | null>(null);

  const metrics = useMemo(() => {
    const activeAssignments = initialData.filter((rp) => rp.isActive !== false).length;
    const uniqueRoles = new Set(initialData.map(rp => rp.roleId)).size;

    return {
      totalAssignments: initialData.length,
      activeAssignments,
      uniqueRoles,
    };
  }, [initialData]);

  const handleEdit = (row: IRolePermission) => {
    setEditingRolePermission(row);
    setOpenModalUpdate(true);
  };

  const columns: ColumnDef<IRolePermission>[] = useMemo(
    () => [
      {
        accessorKey: "role",
        header: "Rol",
        cell: ({ row }) => (
          <span className='font-semibold'>{row.original.role?.name || `ID: ${row.original.roleId}`}</span>
        ),
      },
      {
        accessorKey: "permission",
        header: "Permiso",
        cell: ({ row }) => (
          <span className='text-sm'>{row.original.permission?.name || `ID: ${row.original.permissionId}`}</span>
        ),
      },
      {
        header: "Status",
        accessorKey: "isActive",
        cell: ({ row }) => (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.original.isActive !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {row.original.isActive !== false ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Buttons size='sm' variant='outline' onClick={() => handleEdit(row.original)}>
            Editar
          </Buttons>
        ),
      },
    ],
    [handleEdit],
  );

  const summaryCards = [
    {
      icon: HiOutlineLockClosed,
      label: "Total asignaciones",
      value: metrics.totalAssignments,
      accent: "from-rose-500/40 to-pink-500/40 text-rose-700",
    },
    {
      icon: HiOutlineLockClosed,
      label: "Asignaciones activas",
      value: metrics.activeAssignments,
      accent: "from-emerald-500/40 to-teal-500/40 text-emerald-700",
    },
    {
      icon: HiOutlineLockClosed,
      label: "Roles únicos",
      value: metrics.uniqueRoles,
      accent: "from-amber-500/40 to-orange-500/40 text-amber-700",
    },
  ];

  return (
    <section className='mx-auto flex w-full flex-col gap-6 px-6'>
      <article className='rounded-3xl border border-border/40 bg-gradient-to-br from-rose-600 via-pink-500 to-fuchsia-500 px-8 py-10 text-white shadow-2xl'>
        <header className='space-y-4'>
          <span className='inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/75'>
            {t("title")}
          </span>
          <div className='space-y-2'>
            <h1 className='text-4xl font-semibold leading-tight'>{t("description")}</h1>
            <p className='text-white/80'>Asigna permisos a roles del sistema.</p>
          </div>
          <Buttons
            color='success'
            className='inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-white'
            onClick={() => setOpenModal(true)}>
            <HiOutlinePlusCircle className='h-4 w-4' />
            {tActions("saveRolePermission")}
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

      <Modal size='lg' title="Asignar permiso a rol" open={openModal} onOpenChange={() => setOpenModal(!openModal)}>
        <RegisterRolePermission />
      </Modal>

      <Modal size='lg' open={openModalUpdate} onOpenChange={() => setOpenModalUpdate(!openModalUpdate)} title={t("modal.edit_title")} showCloseButton={true} hideDefaultFooter={true}>
        <UpdateRolePermission initialValues={editingRolePermission} handleClose={() => setOpenModalUpdate(false)} />
      </Modal>
    </section>
  );
};
