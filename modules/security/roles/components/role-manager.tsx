/** @format */

"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  const [roles, setRoles] = useState<IRole[]>(initialData);

  const metrics = useMemo(() => {
    const activeRoles = initialData.filter((role) => role.deleted !== false).length;

    return {
      totalRoles: initialData.length,
      activeRoles,
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
          <span className='text-sm text-muted-foreground'>{info.getValue<string>() || "-"}</span>
        ),
      },
      {
        header: "Status",
        accessorKey: "deleted",
        cell: ({ row }) => (
          <div className='flex items-center'>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                row.original.deleted == false
                  ? "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]"
                  : "bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))]"
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
    },
    {
      icon: HiOutlineShieldCheck,
      label: "Roles activos",
      value: metrics.activeRoles,
    },
  ];

  useEffect(() => {
    setRoles(initialData);
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
              Gestiona los roles del sistema y sus permisos asociados.
            </p>
          </div>
          <Buttons
            color='success'
            className='inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90'
            onClick={() => setOpenModal(true)}>
            <HiOutlinePlusCircle className='h-4 w-4' />
            {tActions("saveRole")}
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
          data={roles}
          columns={columns}
          className='py-2'
        />
      </div>

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
