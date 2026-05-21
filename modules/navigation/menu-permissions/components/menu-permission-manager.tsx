/** @format */

"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import { RegisterMenuPermission, UpdateMenuPermission } from "./form";
import { HiOutlineShieldExclamation, HiOutlinePlusCircle } from "react-icons/hi2";
import { DataTable } from "@repo/ui/table/scenes";
import { IMenuPermission } from "../models/menu-permission.interface";

interface IMenuPermissionManagerProps {
  initialData: IMenuPermission[];
}

export const MenuPermissionManager = ({ initialData }: IMenuPermissionManagerProps) => {
  const t = useTranslations("navigation.menuPermissions");
  const tActions = useTranslations("actions");

  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingMenuPermission, setEditingMenuPermission] = useState<IMenuPermission | null>(null);

  const metrics = useMemo(() => {
    const activeAssignments = initialData.filter((mp) => mp.deleted !== false).length;
    const uniqueMenus = new Set(initialData.map(mp => mp.menu_id)).size;

    return {
      totalAssignments: initialData.length,
      activeAssignments,
      uniqueMenus,
    };
  }, [initialData]);

  const handleEdit = (row: IMenuPermission) => {
    setEditingMenuPermission(row);
    setOpenModalUpdate(true);
  };

  const columns: ColumnDef<IMenuPermission>[] = useMemo(
    () => [
      {
        accessorKey: "menu",
        header: "Menú",
        cell: ({ row }) => (
          <span className='font-semibold'>{row.original.menu?.name || `ID: ${row.original.menuId}`}</span>
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
        accessorKey: "deleted",
        cell: ({ row }) => (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.original.deleted !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {row.original.deleted !== false ? "Active" : "Inactive"}
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
      icon: HiOutlineShieldExclamation,
      label: "Total asignaciones",
      value: metrics.totalAssignments,
      accent: "from-teal-500/40 to-cyan-500/40 text-teal-700",
    },
    {
      icon: HiOutlineShieldExclamation,
      label: "Asignaciones activas",
      value: metrics.activeAssignments,
      accent: "from-emerald-500/40 to-teal-500/40 text-emerald-700",
    },
    {
      icon: HiOutlineShieldExclamation,
      label: "Menús únicos",
      value: metrics.uniqueMenus,
      accent: "from-amber-500/40 to-orange-500/40 text-amber-700",
    },
  ];

  return (
    <section className='mx-auto flex w-full flex-col gap-6 px-6'>
      <article className='rounded-3xl border border-border/40 bg-gradient-to-br from-teal-600 via-cyan-500 to-sky-500 px-8 py-10 text-white shadow-2xl'>
        <header className='space-y-4'>
          <span className='inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/75'>
            {t("title")}
          </span>
          <div className='space-y-2'>
            <h1 className='text-4xl font-semibold leading-tight'>{t("description")}</h1>
            <p className='text-white/80'>Asigna permisos a menús de navegación.</p>
          </div>
          <Buttons
            color='success'
            className='inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-white'
            onClick={() => setOpenModal(true)}>
            <HiOutlinePlusCircle className='h-4 w-4' />
            {tActions("saveMenuPermission")}
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

      <Modal size='lg' title="Asignar permiso a menú" open={openModal} onOpenChange={() => setOpenModal(!openModal)}>
        <RegisterMenuPermission />
      </Modal>

      <Modal size='lg' open={openModalUpdate} onOpenChange={() => setOpenModalUpdate(!openModalUpdate)} title={t("modal.edit_title")} showCloseButton={true} hideDefaultFooter={true}>
        <UpdateMenuPermission initialValues={editingMenuPermission} handleClose={() => setOpenModalUpdate(false)} />
      </Modal>
    </section>
  );
};
