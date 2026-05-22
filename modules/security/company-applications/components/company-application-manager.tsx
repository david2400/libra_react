/** @format */

"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import { RegisterCompanyApplication, UpdateCompanyApplication } from "./form";
import { HiOutlineBuildingOffice, HiOutlinePlusCircle } from "react-icons/hi2";
import { DataTable } from "@repo/ui/table/scenes";
import { ICompanyApplication } from "../models/company-application.interface";
import { useEffect } from "react";

interface ICompanyApplicationManagerProps {
  initialData: ICompanyApplication[];
}

export const CompanyApplicationManager = ({
  initialData,
}: ICompanyApplicationManagerProps) => {
  const t = useTranslations("security.companyApplications");
  const tActions = useTranslations("actions");

  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingCompanyApplication, setEditingCompanyApplication] =
    useState<ICompanyApplication | null>(null);
  const [companyApplications, setCompanyApplications] =
    useState<ICompanyApplication[]>(initialData);
  const [loading, setLoading] = useState(false);

  // const refreshData = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await companyApplicationsClientApi.list();
  //     const companyApplicationsData = Array.isArray(response) ? response : response?.data || [];
  //     setCompanyApplications(companyApplicationsData);
  //   } catch (error) {
  //     console.error('Error refreshing company applications:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Fetch company applications data client-side
  // useEffect(() => {
  //   refreshData();
  // }, []);

  const metrics = useMemo(() => {
    const activeApplications = companyApplications.filter(
      (ca) => ca.is_active !== false,
    ).length;
    const uniqueCompanies = new Set(
      companyApplications.map((ca) => ca.company_id),
    ).size;
    const uniqueApplications = new Set(
      companyApplications.map((ca) => ca.application_id),
    ).size;

    return {
      totalAssignments: companyApplications.length,
      activeApplications,
      uniqueCompanies,
      uniqueApplications,
    };
  }, [companyApplications]);

  const handleEdit = (row: ICompanyApplication) => {
    setEditingCompanyApplication(row);
    setOpenModalUpdate(true);
  };

  const columns: ColumnDef<ICompanyApplication>[] = useMemo(
    () => [
      // {
      //   accessorKey: "company",
      //   header: "Empresa",
      //   cell: ({ row }) => (
      //     <span className='font-semibold'>
      //       {row.original.company?.name || `ID: ${row.original.company_id}`}
      //     </span>
      //   ),
      // },
      // {
      //   accessorKey: "application",
      //   header: "Aplicación",
      //   cell: ({ row }) => (
      //     <span className='font-medium'>
      //       {row.original.application?.name || `ID: ${row.original.application_id}`}
      //     </span>
      //   ),
      // },
      {
        accessorKey: "license_start_date",
        header: "Inicio Licencia",
        cell: ({ row }) => (
          <span className='text-sm'>
            {new Date(row.original.license_start_date).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: "license_end_date",
        header: "Fin Licencia",
        cell: ({ row }) => (
          <span className='text-sm'>
            {new Date(row.original.license_end_date).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: "user_limit",
        header: "Límite Usuarios",
        cell: ({ row }) => (
          <span className='text-sm'>
            {row.original.user_limit || "Ilimitado"}
          </span>
        ),
      },
      {
        accessorKey: "subscription_type",
        header: "Tipo Suscripción",
        cell: ({ row }) => (
          <span className='text-sm capitalize'>
            {row.original.subscription_type || "No definido"}
          </span>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Estado",
        cell: ({ row }) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              row.original.is_active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}>
            {row.original.is_active ? "Activo" : "Inactivo"}
          </span>
        ),
      },
      {
        accessorKey: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className='flex gap-2'>
            <Buttons
              size='sm'
              onClick={() => handleEdit(row.original)}
              className='text-blue-600 hover:text-blue-800'>
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
      icon: HiOutlineBuildingOffice,
      label: "Total Asignaciones",
      value: metrics.totalAssignments,
      accent: "from-rose-500/40 to-pink-500/40 text-rose-700",
    },
    {
      icon: HiOutlineBuildingOffice,
      label: "Licencias Activas",
      value: metrics.activeApplications,
      accent: "from-emerald-500/40 to-teal-500/40 text-emerald-700",
    },
    {
      icon: HiOutlineBuildingOffice,
      label: "Empresas Únicas",
      value: metrics.uniqueCompanies,
      accent: "from-amber-500/40 to-orange-500/40 text-amber-700",
    },
    {
      icon: HiOutlineBuildingOffice,
      label: "Aplicaciones Únicas",
      value: metrics.uniqueApplications,
      accent: "from-blue-500/40 to-indigo-500/40 text-blue-700",
    },
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
              Asigna aplicaciones a las empresas con licencias.
            </p>
          </div>
          <Buttons
            color='success'
            className='inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-white'
            onClick={() => setOpenModal(true)}>
            <HiOutlinePlusCircle className='h-4 w-4' />
            {tActions("saveCompanyApplication")}
          </Buttons>
        </header>
      </article>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
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
        data={companyApplications}
        columns={columns}
        className='py-2'
      />

      <Modal
        size='lg'
        title='Asignar Aplicación a Empresa'
        open={openModal}
        onOpenChange={() => setOpenModal(!openModal)}>
        <RegisterCompanyApplication />
      </Modal>

      <Modal
        size='lg'
        open={openModalUpdate}
        onOpenChange={() => setOpenModalUpdate(!openModalUpdate)}
        title={t("modal.edit_title")}
        showCloseButton={true}
        hideDefaultFooter={true}>
        <UpdateCompanyApplication
          initialValues={editingCompanyApplication}
          handleClose={() => setOpenModalUpdate(false)}
        />
      </Modal>
    </section>
  );
};
