/** @format */

"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import { RegisterPolicy, UpdatePolicy } from "./form";
import { HiOutlineDocumentText, HiOutlinePlusCircle } from "react-icons/hi2";
import { DataTable } from "@repo/ui/table/scenes";
import { IPolicy } from "../models/policy.interface";

interface IPolicyManagerProps {
  initialData: IPolicy[];
}

export const PolicyManager = ({ initialData }: IPolicyManagerProps) => {
  const t = useTranslations("security.policies");
  const tActions = useTranslations("actions");

  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<IPolicy | null>(null);

  const metrics = useMemo(() => {
    const activePolicies = initialData.filter((policy) => policy.deleted !== false).length;

    return {
      totalPolicies: initialData.length,
      activePolicies,
    };
  }, [initialData]);

  const handleEdit = (row: IPolicy) => {
    setEditingPolicy(row);
    handleModalCloseEdit();
  };

  const handleModalCloseEdit = () => {
    setOpenModalUpdate((prev) => !prev);
  };

  const handleModalClose = () => {
    setOpenModal((prev) => !prev);
  };

  const columns: ColumnDef<IPolicy>[] = useMemo(
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
          <span className='text-sm text-muted-foreground'>{info.getValue<string>() || "-"}</span>
        ),
      },
      {
        header: "Status",
        accessorKey: "isActive",
        cell: ({ row }) => (
          <div className='flex items-center'>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                row.original.deleted !== false
                  ? "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]"
                  : "bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))]"
              }`}>
              {row.original.deleted !== false ? "Active" : "Inactive"}
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
          </div>
        ),
      },
    ],
    [t, handleEdit],
  );

  const summaryCards = [
    {
      icon: HiOutlineDocumentText,
      label: "Total de políticas",
      value: metrics.totalPolicies,
    },
    {
      icon: HiOutlineDocumentText,
      label: "Políticas activas",
      value: metrics.activePolicies,
    },
  ];

  return (
    <section className='mx-auto flex w-full flex-col gap-6 px-6'>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight text-foreground'>
              {t("description")}
            </h1>
            <p className='mt-1.5 text-base text-muted-foreground'>
              Define y gestiona las políticas de acceso del sistema.
            </p>
          </div>
          <Buttons
            color='success'
            className='inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90'
            onClick={() => setOpenModal(true)}>
            <HiOutlinePlusCircle className='h-4 w-4' />
            {tActions("savePolicy")}
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

        <DataTable
          data={initialData}
          columns={columns}
          className='py-2'
        />
      </div>

      <Modal
        size='lg'
        title={editingPolicy ? "Editar política" : "Crear política"}
        open={openModal}
        onOpenChange={handleModalClose}>
        <RegisterPolicy />
      </Modal>

      <Modal
        size='lg'
        open={openModalUpdate}
        onOpenChange={handleModalCloseEdit}
        title={t("modal.edit_title")}
        description={t("modal.edit_description")}
        showCloseButton={true}
        hideDefaultFooter={true}>
        <UpdatePolicy
          initialValues={editingPolicy}
          handleClose={handleModalCloseEdit}
        />
      </Modal>
    </section>
  );
};
