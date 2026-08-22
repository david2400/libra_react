/** @format */

"use client";

import React, { useMemo, useState, useEffect } from "react";
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
  const t = useTranslations("account.companies");
  const tActions = useTranslations("actions");

  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<ICompany | null>(null);
  const [companies, setCompanies] = useState<ICompany[]>(initialData);

  useEffect(() => {
    setCompanies(initialData);
  }, [initialData]);

  const metrics = useMemo(() => {
    const activeCompanies = companies.filter(
      (company) => company.is_active !== false,
    ).length;
    const uniqueIndustries = new Set(
      companies.map((c) => c.economic_activity).filter(Boolean),
    ).size;

    return {
      totalCompanies: companies.length,
      activeCompanies,
      uniqueIndustries,
    };
  }, [companies]);

  const handleEdit = (row: ICompany) => {
    console.log(row)
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
            <span className='font-semibold text-foreground'>
              {info.getValue<string>()}
            </span>
            {info.row.original.economic_activity && (
              <span className='text-xs text-muted-foreground'>
                {info.row.original.economic_activity}
              </span>
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
          return (
            <span className='text-sm'>{size ? sizeLabels[size] : "-"}</span>
          );
        },
      },
      {
        accessorKey: "economic_activity",
        header: t("fields.economic_activity"),
        cell: (info) => {
          const activityLabels: Record<string, string> = {
            technology: "Tecnología",
            finance: "Finanzas",
            healthcare: "Salud",
            education: "Educación",
            retail: "Retail",
            manufacturing: "Manufactura",
            consulting: "Consultoría",
            other: "Otro",
          };
          const activity = info.getValue<string>();
          return (
            <span className='text-sm'>
              {activity ? activityLabels[activity] || activity : "-"}
            </span>
          );
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
        accessorKey: "is_active",
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              row.original.is_active !== false
                ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]"
                : "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]"
            }`}>
            {row.original.is_active !== false ? "Activa" : "Inactiva"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <Buttons
            size='sm'
            variant='outline'
            onClick={() => handleEdit(row.original)}>
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
      <article className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
        <header className='space-y-4'>
          <span className='inline-flex w-fit items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
            {t("title")}
          </span>
          <div className='space-y-2'>
            <h1 className='text-3xl font-bold tracking-tight text-foreground'>
              {t("description")}
            </h1>
            <p className='mt-1.5 text-base text-muted-foreground'>
              Gestiona las empresas y sus datos corporativos.
            </p>
          </div>
          <Buttons
            className='inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90'
            onClick={() => setOpenModal(true)}>
            <HiOutlinePlusCircle className='h-4 w-4' />
            {tActions("saveCompany")}
          </Buttons>
        </header>
      </article>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className='rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md'>
            <div className='flex items-center justify-between text-sm font-semibold text-muted-foreground'>
              <span>{card.label}</span>
              <card.icon className='h-5 w-5 text-muted-foreground' />
            </div>
            <p className='mt-2 text-2xl font-semibold text-foreground'>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
        <DataTable data={companies} columns={columns} />
      </div>

      <Modal
        size='lg'
        title='Crear empresa'
        open={openModal}
        onOpenChange={() => setOpenModal(!openModal)}>
        <RegisterCompany />
      </Modal>

      <Modal
        size='lg'
        open={openModalUpdate}
        onOpenChange={() => setOpenModalUpdate(!openModalUpdate)}
        title={t("modal.edit_title")}
        showCloseButton={true}
        hideDefaultFooter={true}>
        <UpdateCompany
          initialValues={editingCompany}
          handleClose={() => setOpenModalUpdate(false)}
        />
      </Modal>
    </section>
  );
};
