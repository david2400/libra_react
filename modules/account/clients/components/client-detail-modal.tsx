/** @format */

"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import {
  HiOutlineInformationCircle,
  HiOutlineUsers,
  HiOutlineUserCircle,
} from "react-icons/hi2";
import { IClient } from "../models/client.interface";
import { IUser } from "@/modules/account/users/models/user.interface";
import { UpdateClient } from "./form";
import { ClientUsersSection } from "./client-users-section";

interface ClientDetailModalProps {
  client: IClient | null;
  open: boolean;
  onClose: () => void;
  initialUsers?: IUser[];
  onUserCreated?: (user: IUser) => void;
  onUserUpdated?: (user: IUser) => void;
  onUserDeleted?: (userId: number) => void;
}

type TabType = "info" | "users";

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  open,
  onClose,
  initialUsers = [],
  onUserCreated,
  onUserUpdated,
  onUserDeleted,
}) => {
  const t = useTranslations("account.clients");
  const [activeTab, setActiveTab] = useState<TabType>("info");

  if (!client) return null;

  const fullName = `${client.first_name} ${client.second_name || ""} ${client.first_last_name} ${client.second_last_name || ""}`.trim();
  const userCount = initialUsers.length;

  return (
    <Modal
      size="xl"
      title={`Detalle de ${fullName}`}
      open={open}
      onOpenChange={onClose}>
      <div className="flex flex-col">
        {/* Header con información del cliente */}
        <div className="border-b border-border bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <HiOutlineUserCircle className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">
                {fullName}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>
                  {client.type_id}: {client.card_id}
                </span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-1">
                  <HiOutlineUsers className="h-4 w-4" />
                  {userCount} {userCount === 1 ? "usuario" : "usuarios"}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    client.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}>
                  {client.status === "active" ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-border bg-muted/30">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab("info")}
              className={`relative flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "info"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <HiOutlineInformationCircle className="h-4 w-4" />
              Información del Cliente
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`relative flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <HiOutlineUsers className="h-4 w-4" />
              Gestionar Usuarios
              {userCount > 0 && (
                <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {userCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {activeTab === "info" ? (
            <ClientInfoTab client={client} />
          ) : (
            <ClientUsersSection
              clientId={client.id_client!}
              clientName={fullName}
              initialUsers={initialUsers}
              onUserCreated={onUserCreated}
              onUserUpdated={onUserUpdated}
              onUserDeleted={onUserDeleted}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/30 px-6 py-4">
          <div className="flex justify-end">
            <Buttons variant="outline" onClick={onClose}>
              Cerrar
            </Buttons>
          </div>
        </div>
      </div>
    </Modal>
  );
};

/**
 * Tab de información del cliente
 */
interface ClientInfoTabProps {
  client: IClient;
}

const ClientInfoTab: React.FC<ClientInfoTabProps> = ({ client }) => {
  const t = useTranslations("account.clients");

  return (
    <div className="space-y-6">
      {/* Información Personal Card */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <HiOutlineInformationCircle className="h-5 w-5 text-primary" />
          Datos Personales
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoField label="Primer Nombre" value={client.first_name} />
          <InfoField label="Segundo Nombre" value={client.second_name} />
          <InfoField label="Primer Apellido" value={client.first_last_name} />
          <InfoField
            label="Segundo Apellido"
            value={client.second_last_name}
          />
          <InfoField label="Tipo de Identificación" value={client.type_id} />
          <InfoField label="Número de Identificación" value={client.card_id} />
          <InfoField label="Sexo" value={client.sex} />
          <InfoField label="Género" value={client.gender} />
        </div>
      </div>

      {/* Formulario de Edición */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Editar Información
        </h3>
        <UpdateClient initialValues={client} />
      </div>
    </div>
  );
};

/**
 * Campo de información reutilizable
 */
interface InfoFieldProps {
  label: string;
  value?: string | null;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value }) => (
  <div>
    <label className="block text-xs font-medium text-muted-foreground">
      {label}
    </label>
    <p className="mt-1 text-sm font-medium text-foreground">
      {value || <span className="text-muted-foreground">-</span>}
    </p>
  </div>
);
