/** @format */

"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import { RegisterProfile, UpdateProfile } from "./form";
import { HiOutlineIdentification, HiOutlinePlusCircle } from "react-icons/hi2";
import { DataTable } from "@repo/ui/table/scenes";
import { IProfile } from "../models/profile.interface";

interface IProfileManagerProps {
  initialData: IProfile[];
}

export const ProfileManager = ({ initialData }: IProfileManagerProps) => {
  const t = useTranslations("account.profiles");
  const tActions = useTranslations("actions");

  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<IProfile | null>(null);

  const metrics = useMemo(() => {
    const activeProfiles = initialData.filter((profile) => profile.deleted !== false).length;
    const uniqueTimezones = new Set(initialData.map(p => p.timezone).filter(Boolean)).size;

    return {
      totalProfiles: initialData.length,
      activeProfiles,
      uniqueTimezones,
    };
  }, [initialData]);

  const handleEdit = (row: IProfile) => {
    setEditingProfile(row);
    setOpenModalUpdate(true);
  };

  const columns: ColumnDef<IProfile>[] = useMemo(
    () => [
      {
        accessorKey: "display_name",
        header: t("fields.display_name"),
        cell: (info) => (
          <div className='flex flex-col'>
            <span className='font-semibold text-foreground'>{info.getValue<string>() || "-"}</span>
            {info.row.original.first_name && info.row.original.last_name && (
              <span className='text-xs text-muted-foreground'>
                {info.row.original.first_name} {info.row.original.last_name}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "userId",
        header: "Usuario ID",
        cell: (info) => (
          <span className='text-sm'>{info.getValue<string | number>()}</span>
        ),
      },
      {
        accessorKey: "phone",
        header: t("fields.phone"),
        cell: (info) => (
          <span className='text-sm'>{info.getValue<string>() || "-"}</span>
        ),
      },
      {
        accessorKey: "theme",
        header: t("fields.theme"),
        cell: (info) => {
          const themeLabels: Record<string, string> = {
            light: "Claro",
            dark: "Oscuro",
            auto: "Auto",
          };
          const theme = info.getValue<string>();
          return <span className='text-sm'>{theme ? themeLabels[theme] : "-"}</span>;
        },
      },
      {
        header: "Estado",
        accessorKey: "deleted",
        cell: ({ row }) => (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.original.deleted !== false ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]" : "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]"
          }`}>
            {row.original.deleted !== false ? "Activo" : "Inactivo"}
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
      icon: HiOutlineIdentification,
      label: "Total de perfiles",
      value: metrics.totalProfiles,
      accent: "from-pink-500/40 to-rose-500/40 text-pink-700",
    },
    {
      icon: HiOutlineIdentification,
      label: "Perfiles activos",
      value: metrics.activeProfiles,
      accent: "from-rose-500/40 to-red-500/40 text-rose-700",
    },
    {
      icon: HiOutlineIdentification,
      label: "Zonas horarias",
      value: metrics.uniqueTimezones,
      accent: "from-red-500/40 to-orange-500/40 text-red-700",
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
            <h1 className='text-3xl font-bold tracking-tight text-foreground'>{t("description")}</h1>
            <p className='mt-1.5 text-base text-muted-foreground'>Gestiona los perfiles de usuario y sus preferencias.</p>
          </div>
          <Buttons
            className='inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90'
            onClick={() => setOpenModal(true)}>
            <HiOutlinePlusCircle className='h-4 w-4' />
            {tActions("saveProfile")}
          </Buttons>
        </header>
      </article>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {summaryCards.map((card) => (
          <div key={card.label} className='rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md'>
            <div className='flex items-center justify-between text-sm font-semibold text-muted-foreground'>
              <span>{card.label}</span>
              <card.icon className='h-5 w-5 text-muted-foreground' />
            </div>
            <p className='mt-2 text-2xl font-semibold text-foreground'>{card.value}</p>
          </div>
        ))}
      </div>

      <div className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
        <DataTable data={initialData} columns={columns} />
      </div>

      <Modal size='lg' title="Crear perfil" open={openModal} onOpenChange={() => setOpenModal(!openModal)}>
        <RegisterProfile />
      </Modal>

      <Modal size='lg' open={openModalUpdate} onOpenChange={() => setOpenModalUpdate(!openModalUpdate)} title={t("modal.edit_title")} showCloseButton={true} hideDefaultFooter={true}>
        <UpdateProfile initialValues={editingProfile} handleClose={() => setOpenModalUpdate(false)} />
      </Modal>
    </section>
  );
};
