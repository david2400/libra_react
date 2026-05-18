/** @format */

"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import { RegisterApplication, UpdateApplication } from "./form";
import { HiOutlineSquares2X2, HiOutlinePlusCircle } from "react-icons/hi2";
import { DataTable } from "@repo/ui/table/scenes";
import { IApplication } from "@/modules/security/applications";
import type { IApplicationUpdateRequest } from "@/modules/security/applications";

interface IApplicationManagerProps {
  initialData: IApplication[];
}

export const ApplicationManager = ({
  initialData,
}: IApplicationManagerProps) => {
  const t = useTranslations("security.applications");
  const tActions = useTranslations("actions");

  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<IApplicationUpdateRequest | null>(null);

  const metrics = useMemo(() => {
    const activeApps = initialData.filter(
      (app) => app.deleted === false,
    ).length;
    const maintenanceApps = initialData.filter(
      (app) => app.maintenance_mode === true,
    ).length;

    return {
      totalApplications: initialData.length,
      activeApps,
      maintenanceApps,
    };
  }, [initialData]);

  const handleEdit = (row: IApplication) => {
    console.log("row", row);
    setEditingApplication(row);
    handleModalCloseEdit();
  };

  const handleModalCloseEdit = () => {
    setOpenModalUpdate((prev) => !prev);
  };

  const handleModalClose = () => {
    setOpenModal((prev) => !prev);
  };

  const columns: ColumnDef<IApplication>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: t("fields.name"),
        cell: (info) => (
          <div className='flex flex-col'>
            <span className='font-semibold text-foreground'>
              {info.row.original.name}
            </span>
            {/* {info.row.original.version && (
              <span className='text-xs text-muted-foreground'>
                v{info.row.original.version}
              </span>
            )} */}
          </div>
        ),
      },
      // {
      //   accessorKey: "baseUrl",
      //   header: t("fields.baseUrl"),
      //   cell: (info) => (
      //     <span className='text-sm font-mono'>
      //       {info.getValue<string>() || "-"}
      //     </span>
      //   ),
      // },

      {
        accessorKey: "description",
        header: t("fields.description"),
        cell: (info) => (
          <span className='text-sm text-muted-foreground'>
            {info.getValue<string>() || "-"}
          </span>
        ),
      },

      {
        accessorKey: "maintenance_mode",
        header: t("fields.maintenance_mode"),
        cell: ({ row }) => {
          const isMaintenance = row.original.maintenance_mode;
          const statusColor = isMaintenance
            ? "bg-yellow-100 text-yellow-800"
            : "bg-green-100 text-green-800";
          const status = isMaintenance ? "maintenance" : "active";
          return (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
              {status}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          console.log(row.original),
          <div className='flex gap-2'>
            <Buttons
              size='sm'
              variant='outline'
              onClick={() => handleEdit(row.original)}>
              Editar
            </Buttons>
          </div>
        ),
      },
    ],
    [],
  );

  const summaryCards = [
    {
      icon: HiOutlineSquares2X2,
      label: "Total de aplicaciones",
      value: metrics.totalApplications,
      accent: "from-cyan-500/40 to-blue-500/40 text-cyan-700",
    },
    {
      icon: HiOutlineSquares2X2,
      label: "Aplicaciones activas",
      value: metrics.activeApps,
      accent: "from-emerald-500/40 to-teal-500/40 text-emerald-700",
    },
    {
      icon: HiOutlineSquares2X2,
      label: "En mantenimiento",
      value: metrics.maintenanceApps,
      accent: "from-amber-500/40 to-orange-500/40 text-amber-700",
    },
  ];

  return (
    <section className='mx-auto flex w-full flex-col gap-6 px-6'>
      <article className='rounded-3xl border border-border/40 bg-gradient-to-br from-cyan-600 via-blue-500 to-indigo-500 px-8 py-10 text-white shadow-2xl'>
        <header className='space-y-4'>
          <span className='inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/75'>
            {t("title")}
          </span>
          <div className='space-y-2'>
            <h1 className='text-4xl font-semibold leading-tight'>
              {t("description")}
            </h1>
            <p className='text-white/80'>
              Gestiona las aplicaciones del ecosistema y sus configuraciones.
            </p>
          </div>
          <Buttons
            color='success'
            className='inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-white'
            onClick={() => setOpenModal(true)}>
            <HiOutlinePlusCircle className='h-4 w-4' />
            {tActions("saveApplication")}
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

      <DataTable data={initialData} columns={columns} className='py-2' />

      <Modal
        size='lg'
        title={editingApplication ? "Editar aplicación" : "Crear aplicación"}
        open={openModal}
        onOpenChange={handleModalClose}>
        <RegisterApplication />
      </Modal>

      <Modal
        size='lg'
        open={openModalUpdate}
        onOpenChange={handleModalCloseEdit}
        title={t("modal.edit_title")}
        description={t("modal.edit_description")}
        showCloseButton={true}
        hideDefaultFooter={true}>
        <UpdateApplication
          initialValues={editingApplication}
          handleClose={handleModalCloseEdit}
        />
      </Modal>
    </section>
  );
};
