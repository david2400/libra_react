/** @format */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import { RegisterApplication, UpdateApplication } from "./form";
import { HiOutlineSquares2X2, HiOutlinePlusCircle } from "react-icons/hi2";
import { DataTable } from "@repo/ui/table/scenes";
import { IApplication } from "@/server/domains/access-control/security/applications";
import { IApplicationUpdateRequest } from "../models/application.interface";

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
  const [application, setApplications] = useState<IApplication[]>(initialData);

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
          </div>
        ),
      },
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
            ? "bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))]"
            : "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]";
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
    },
    {
      icon: HiOutlineSquares2X2,
      label: "Aplicaciones activas",
      value: metrics.activeApps,
    },
    {
      icon: HiOutlineSquares2X2,
      label: "En mantenimiento",
      value: metrics.maintenanceApps,
    },
  ];

  useEffect(() => {
    setApplications(initialData);
  }, [initialData]);

  return (
    <section className='mx-auto flex w-full flex-col gap-6 px-6'>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight text-foreground'>
              {t("description")}
            </h1>
            <p className='mt-1.5 text-base text-muted-foreground'>
              Gestiona las aplicaciones del ecosistema y sus configuraciones.
            </p>
          </div>
          <Buttons
            color='success'
            className='inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90'
            onClick={() => setOpenModal(true)}>
            <HiOutlinePlusCircle className='h-4 w-4' />
            {tActions("saveApplication")}
          </Buttons>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className='bg-card border border-border rounded-2xl shadow-sm p-6 transition-all duration-200 hover:shadow-md'>
              <div className='flex items-center justify-between text-sm font-semibold text-muted-foreground'>
                <span>{card.label}</span>
                <card.icon className='h-5 w-5 text-primary' />
              </div>
              <p className='mt-2 text-2xl font-semibold text-foreground'>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <DataTable data={application} columns={columns} className='py-2' />
      </div>

      <Modal
        size='lg'
        title={"Crear aplicación"}
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
