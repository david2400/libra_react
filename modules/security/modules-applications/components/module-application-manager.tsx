/** @format */

"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import { RegisterModuleApplication, UpdateModuleApplication } from "./form";
import { HiOutlineCube, HiOutlinePlusCircle } from "react-icons/hi2";
import { DataTable } from "@repo/ui/table/scenes";
import { IModuleApplication } from "../models/module-application.interface";

interface IModuleApplicationManagerProps {
  initialData: IModuleApplication[];
}

export const ModuleApplicationManager = ({ initialData }: IModuleApplicationManagerProps) => {
  const t = useTranslations("security.modulesApplications");
  const tActions = useTranslations("actions");

  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingModuleApplication, setEditingModuleApplication] = useState<IModuleApplication | null>(null);

  const metrics = useMemo(() => {
    const activeAssignments = initialData.filter((ma) => ma.isActive !== false).length;
    const uniqueModules = new Set(initialData.map(ma => ma.moduleId)).size;

    return {
      totalAssignments: initialData.length,
      activeAssignments,
      uniqueModules,
    };
  }, [initialData]);

  const handleEdit = (row: IModuleApplication) => {
    setEditingModuleApplication(row);
    setOpenModalUpdate(true);
  };

  const columns: ColumnDef<IModuleApplication>[] = useMemo(
    () => [
      {
        accessorKey: "module",
        header: "Módulo",
        cell: ({ row }) => (
          <span className='font-semibold'>{row.original.module?.name || `ID: ${row.original.moduleId}`}</span>
        ),
      },
      {
        accessorKey: "application",
        header: "Aplicación",
        cell: ({ row }) => (
          <span className='text-sm'>{row.original.application?.name || `ID: ${row.original.applicationId}`}</span>
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
      icon: HiOutlineCube,
      label: "Total asignaciones",
      value: metrics.totalAssignments,
      accent: "from-sky-500/40 to-blue-500/40 text-sky-700",
    },
    {
      icon: HiOutlineCube,
      label: "Asignaciones activas",
      value: metrics.activeAssignments,
      accent: "from-emerald-500/40 to-teal-500/40 text-emerald-700",
    },
    {
      icon: HiOutlineCube,
      label: "Módulos únicos",
      value: metrics.uniqueModules,
      accent: "from-amber-500/40 to-orange-500/40 text-amber-700",
    },
  ];

  return (
    <section className='mx-auto flex w-full flex-col gap-6 px-6'>
      <article className='rounded-3xl border border-border/40 bg-gradient-to-br from-sky-600 via-blue-500 to-indigo-600 px-8 py-10 text-white shadow-2xl'>
        <header className='space-y-4'>
          <span className='inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/75'>
            {t("title")}
          </span>
          <div className='space-y-2'>
            <h1 className='text-4xl font-semibold leading-tight'>{t("description")}</h1>
            <p className='text-white/80'>Asigna módulos a aplicaciones del ecosistema.</p>
          </div>
          <Buttons
            color='success'
            className='inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-white'
            onClick={() => setOpenModal(true)}>
            <HiOutlinePlusCircle className='h-4 w-4' />
            {tActions("saveModuleApplication")}
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

      <Modal size='lg' title="Asignar módulo a aplicación" open={openModal} onOpenChange={() => setOpenModal(!openModal)}>
        <RegisterModuleApplication />
      </Modal>

      <Modal size='lg' open={openModalUpdate} onOpenChange={() => setOpenModalUpdate(!openModalUpdate)} title={t("modal.edit_title")} showCloseButton={true} hideDefaultFooter={true}>
        <UpdateModuleApplication initialValues={editingModuleApplication} handleClose={() => setOpenModalUpdate(false)} />
      </Modal>
    </section>
  );
};
