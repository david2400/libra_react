/** @format */

"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import { RegisterPermission, UpdatePermission } from "./form";
import { HiOutlineKey, HiOutlinePlusCircle } from "react-icons/hi2";
import { DataTable } from "@repo/ui/table/scenes";
import { IPermission } from "../models/permission.interface";
import { clientApi } from "@/lib/client-api";

interface IPermissionManagerProps {
  initialData: IPermission[];
}

export const PermissionManager = ({ initialData }: IPermissionManagerProps) => {
  const t = useTranslations("security.permissions");
  const tActions = useTranslations("actions");

  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState<IPermission | null>(null);
  const [permissions, setPermissions] = useState<IPermission[]>(initialData);
  const [loading, setLoading] = useState(false);

  // Fetch permissions data client-side
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        const response = await clientApi.get<{ data: IPermission[]; meta: any }>('/api/access_control/permissions');
        const permissionsData = response.data || [];
        setPermissions(permissionsData);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        // Keep initial data if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const metrics = useMemo(() => {
    const totalPermissions = permissions.length;
    const uniqueApplications = new Set(permissions.map(p => p.application_id).filter(Boolean)).size;

    return {
      totalPermissions,
      activePermissions: totalPermissions, // All permissions are considered active by default
      uniqueApplications,
    };
  }, [permissions]);

  const handleEdit = (row: IPermission) => {
    setEditingPermission(row);
    handleModalCloseEdit();
  };

  const handleModalCloseEdit = () => {
    setOpenModalUpdate((prev) => !prev);
  };

  const handleModalClose = () => {
    setOpenModal((prev) => !prev);
  };

  const columns: ColumnDef<IPermission>[] = useMemo(
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
        accessorKey: "module_aplication_id",
        header: t("fields.module_aplication_id"),
        cell: (info) => (
          <span className='text-sm'>{info.getValue<number>() || "-"}</span>
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
        header: "Aplicación ID",
        accessorKey: "aplications_id",
        cell: (info) => (
          <span className='text-sm'>{info.getValue<number>() || "-"}</span>
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
      icon: HiOutlineKey,
      label: "Total de permisos",
      value: metrics.totalPermissions,
      accent: "from-purple-500/40 to-pink-500/40 text-purple-700",
    },
    {
      icon: HiOutlineKey,
      label: "Permisos activos",
      value: metrics.activePermissions,
      accent: "from-emerald-500/40 to-teal-500/40 text-emerald-700",
    },
    {
      icon: HiOutlineKey,
      label: "Aplicaciones únicas",
      value: metrics.uniqueApplications,
      accent: "from-amber-500/40 to-orange-500/40 text-amber-700",
    },
  ];

  return (
    <section className='mx-auto flex w-full flex-col gap-6 px-6'>
      <article className='rounded-3xl border border-border/40 bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 px-8 py-10 text-white shadow-2xl'>
        <header className='space-y-4'>
          <span className='inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/75'>
            {t("title")}
          </span>
          <div className='space-y-2'>
            <h1 className='text-4xl font-semibold leading-tight'>
              {t("description")}
            </h1>
            <p className='text-white/80'>
              Gestiona los permisos del sistema y controla el acceso a recursos.
            </p>
          </div>
          <Buttons
            color='success'
            className='inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-white'
            onClick={() => setOpenModal(true)}>
            <HiOutlinePlusCircle className='h-4 w-4' />
            {tActions("savePermission")}
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

      <DataTable
        data={permissions}
        columns={columns}
        className='py-2'
      />

      <Modal
        size='lg'
        title={editingPermission ? "Editar permiso" : "Crear permiso"}
        open={openModal}
        onOpenChange={handleModalClose}>
        <RegisterPermission />
      </Modal>

      <Modal
        size='lg'
        open={openModalUpdate}
        onOpenChange={handleModalCloseEdit}
        title={t("modal.edit_title")}
        description={t("modal.edit_description")}
        showCloseButton={true}
        hideDefaultFooter={true}>
        <UpdatePermission
          initialValues={editingPermission}
          handleClose={handleModalCloseEdit}
        />
      </Modal>
    </section>
  );
};
