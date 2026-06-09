/** @format */

"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import { RegisterUserCompany, UpdateUserCompany } from "./form";
import {
  HiOutlineBuildingOffice2,
  HiOutlinePlusCircle,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePencil,
} from "react-icons/hi2";
import { DataTable } from "@repo/ui/table/scenes";
import {
  IUserCompanyWithDetails,
  IUserCompanyUpdateRequest,
} from "../models/user-company.interface";

interface IUserCompanyManagerProps {
  initialData: IUserCompanyWithDetails[];
  users: any[];
  companies: any[];
  companyId?: number;
}

export const UserCompanyManager = ({
  initialData,
  users,
  companies,
  companyId,
}: IUserCompanyManagerProps) => {
  const t = useTranslations("account.userCompanies");
  const tCommon = useTranslations("common");

  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingAssignment, setEditingAssignment] =
    useState<IUserCompanyUpdateRequest | null>(null);

  const metrics = useMemo(() => {
    const primaryAssignments = initialData.filter(
      (item) => item.is_primary === true
    ).length;
    const uniqueUsers = new Set(initialData.map((item) => item.user_id)).size;

    return {
      totalAssignments: initialData.length,
      primaryAssignments,
      uniqueUsers,
    };
  }, [initialData]);

  const handleEdit = (row: IUserCompanyWithDetails) => {
    setEditingAssignment({
      user_id: row.user_id,
      company_id: row.company_id,
      is_primary: row.is_primary,
    });
    setOpenModalUpdate(true);
  };

  const handleModalCloseEdit = () => {
    setOpenModalUpdate((prev) => !prev);
    setEditingAssignment(null);
  };

  const handleModalClose = () => {
    setOpenModal((prev) => !prev);
  };

  const columns: ColumnDef<IUserCompanyWithDetails>[] = useMemo(
    () => [
      {
        accessorKey: "user_name",
        header: t("fields.user"),
        cell: (info) => (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              {info.getValue<string>() || `Usuario #${info.row.original.user_id}`}
            </span>
            <span className="text-xs text-muted-foreground">
              ID: {info.row.original.user_id}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "company_name",
        header: t("fields.company"),
        cell: (info) => (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              {info.getValue<string>() || "-"}
            </span>
            {info.row.original.company_nit && (
              <span className="text-xs text-muted-foreground">
                NIT: {info.row.original.company_nit}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "is_primary",
        header: t("fields.is_primary"),
        cell: ({ row }) => {
          const isPrimary = row.original.is_primary;
          return isPrimary ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <HiOutlineCheckCircle className="h-3.5 w-3.5" />
              Principal
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              Secundaria
            </span>
          );
        },
      },
      {
        id: "actions",
        header: tCommon("actions"),
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Buttons
              size="sm"
              variant="outline"
              className="inline-flex items-center gap-1.5"
              onClick={() => handleEdit(row.original)}>
              <HiOutlinePencil className="h-3.5 w-3.5" />
              {tCommon("edit")}
            </Buttons>
          </div>
        ),
      },
    ],
    [t, tCommon]
  );

  return (
    <section className="mx-auto flex w-full flex-col gap-6 px-6">
      <article className="rounded-3xl border border-border/40 bg-gradient-to-br from-cyan-600 via-blue-500 to-green-500 px-8 py-10 text-white shadow-2xl">
        <header className="space-y-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/75">
            {t("title")}
          </span>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold leading-tight">
              {t("description")}
            </h1>
            <p className="text-white/80">
              {t("subtitle")}
            </p>
          </div>
          <Buttons
            color="success"
            className="inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-white"
            onClick={() => setOpenModal(true)}>
            <HiOutlinePlusCircle className="h-4 w-4" />
            {t("createButton")}
          </Buttons>
        </header>
      </article>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-cyan-500/40 to-blue-500/40 text-cyan-700 px-5 py-4 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between text-sm font-semibold text-white/80">
            <span>Total Asignaciones</span>
            <HiOutlineBuildingOffice2 className="h-5 w-5 text-white/70" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">
            {metrics.totalAssignments}
          </p>
        </div>
        <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-emerald-500/40 to-teal-500/40 text-emerald-700 px-5 py-4 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between text-sm font-semibold text-white/80">
            <span>Usuarios con Empresas</span>
            <HiOutlineUserGroup className="h-5 w-5 text-white/70" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">
            {metrics.uniqueUsers}
          </p>
        </div>
        <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-amber-500/40 to-orange-500/40 text-amber-700 px-5 py-4 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between text-sm font-semibold text-white/80">
            <span>Asignaciones Principales</span>
            <HiOutlineCheckCircle className="h-5 w-5 text-white/70" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">
            {metrics.primaryAssignments}
          </p>
        </div>
      </div>

      {initialData.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 py-16">
          <div className="rounded-full bg-primary/10 p-4">
            <HiOutlineBuildingOffice2 className="h-12 w-12 text-primary" />
          </div>
          <p className="mt-4 text-lg font-semibold text-foreground">
            No hay asignaciones registradas
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea la primera asignación para vincular usuarios con empresas
          </p>
          <Buttons
            size="sm"
            onClick={() => setOpenModal(true)}
            className="mt-6 inline-flex items-center gap-2">
            <HiOutlinePlusCircle className="h-4 w-4" />
            Crear Primera Asignación
          </Buttons>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <DataTable data={initialData} columns={columns} />
        </div>
      )}

      <Modal
        size="md"
        title={t("modal.create_title")}
        open={openModal}
        onOpenChange={handleModalClose}>
        <RegisterUserCompany
          users={users}
          companies={companies}
          onSuccess={handleModalClose}
          companyId={companyId}
        />
      </Modal>

      <Modal
        size="md"
        title={t("modal.edit_title")}
        open={openModalUpdate}
        onOpenChange={handleModalCloseEdit}>
        <UpdateUserCompany
          initialValues={editingAssignment}
          handleClose={handleModalCloseEdit}
          users={users}
          companies={companies}
        />
      </Modal>
    </section>
  );
};
