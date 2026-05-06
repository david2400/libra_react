/** @format */

"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import { RegisterCompany, UpdateCompany } from "./form";
import { HiOutlineBuildingOffice, HiOutlinePlusCircle } from "react-icons/hi2";
import { DataTable } from "@repo/ui/table/scenes";
import { ICompany } from "../models/company.interface";

interface ICompanyManagerProps {
  initialData: ICompany[];
}

export const CompanyManager = ({ initialData }: ICompanyManagerProps) => {
  const t = useTranslations("AccessControl.account.companies");
  const tActions = useTranslations("AccessControl.actions");

  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<ICompany | null>(null);

  const metrics = useMemo(() => {
    const activeCompanies = initialData.filter((company) => company.isActive !== false).length;
    const uniqueIndustries = new Set(initialData.map(c => c.industry).filter(Boolean)).size;

    return {
      totalCompanies: initialData.length,
      activeCompanies,
      uniqueIndustries,
    };
  }, [initialData]);

  const handleEdit = (row: ICompany) => {
    setEditingCompany(row);
    setOpenModalUpdate(true);
  };

  const columns: ColumnDef<ICompany>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: t("fields.name"),
        cell: (info) => (
          <div className='flex flex-col'>
            <span className='font-semibold text-foreground'>{info.getValue<string>()}</span>
            {info.row.original.industry && (
              <span className='text-xs text-muted-foreground'>{info.row.original.industry}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "size",
        header: t("fields.size"),
        cell: (info) => {
          const sizeLabels: Record<string, string> = {
            small: "Pequeña",
            medium: "Mediana",
            large: "Grande",
            enterprise: "Empresa",
          };
          const size = info.getValue<string>();
          return <span className='text-sm'>{size ? sizeLabels[size] : "-"}</span>;
        },
      },
      {
        accessorKey: "email",
        header: t("fields.email"),
        cell: (info) => (
          <span className='text-sm'>{info.getValue<string>() || "-"}</span>
        ),
      },
      {
        accessorKey: "city",
        header: t("fields.city"),
        cell: (info) => (
          <span className='text-sm'>{info.getValue<string>() || "-"}</span>
        ),
      },
      {
        header: "Estado",
        accessorKey: "isActive",
        cell: ({ row }) => (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.original.isActive !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {row.original.isActive !== false ? "Activa" : "Inactiva"}
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
      icon: HiOutlineBuildingOffice,
      label: "Total de empresas",
      value: metrics.totalCompanies,
      accent: "from-slate-500/40 to-gray-500/40 text-slate-700",
    },
    {
      icon: HiOutlineBuildingOffice,
      label: "Empresas activas",
      value: metrics.activeCompanies,
      accent: "from-zinc-500/40 to-stone-500/40 text-zinc-700",
    },
    {
      icon: HiOutlineBuildingOffice,
      label: "Industrias únicas",
      value: metrics.uniqueIndustries,
      accent: "from-gray-500/40 to-neutral-500/40 text-gray-700",
    },
  ];

  return (
    <section className='mx-auto flex w-full flex-col gap-6 px-6'>
      <article className='rounded-3xl border border-border/40 bg-gradient-to-br from-slate-600 via-gray-500 to-zinc-500 px-8 py-10 text-white shadow-2xl'>
        <header className='space-y-4'>
          <span className='inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/75'>
            {t("title")}
          </span>
          <div className='space-y-2'>
            <h1 className='text-4xl font-semibold leading-tight'>{t("description")}</h1>
            <p className='text-white/80'>Gestiona las empresas y sus datos corporativos.</p>
          </div>
          <Buttons
            color='success'
            className='inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-white'
            onClick={() => setOpenModal(true)}>
            <HiOutlinePlusCircle className='h-4 w-4' />
            {tActions("saveCompany")}
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

      <Modal size='lg' title="Crear empresa" open={openModal} onOpenChange={() => setOpenModal(!openModal)}>
        <RegisterCompany />
      </Modal>

      <Modal size='lg' open={openModalUpdate} onOpenChange={() => setOpenModalUpdate(!openModalUpdate)} title={t("modal.edit_title")} showCloseButton={true} hideDefaultFooter={true}>
        <UpdateCompany initialValues={editingCompany} handleClose={() => setOpenModalUpdate(false)} />
      </Modal>
    </section>
  );
};
