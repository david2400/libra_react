/** @format */

"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import { DataTable } from "@repo/ui/table/scenes";
import {
  HiOutlineUser,
  HiOutlinePlusCircle,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
} from "react-icons/hi2";
import { IUser } from "@/modules/account/users/models/user.interface";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { updateUserServerAction } from "@/app/[locale]/(protected)/account/users/actions";

interface ClientUsersSectionProps {
  clientId: number;
  clientName: string;
  initialUsers?: IUser[];
  onUserCreated?: (user: IUser) => void;
  onUserUpdated?: (user: IUser) => void;
  onUserDeleted?: (userId: number) => void;
}

export const ClientUsersSection: React.FC<ClientUsersSectionProps> = ({
  clientId,
  clientName,
  initialUsers = [],
  onUserCreated,
  onUserUpdated,
  onUserDeleted,
}) => {
  const t = useTranslations("account.users");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [users, setUsers] = useState<IUser[]>(initialUsers);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "active").length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [users]);

  const handleEdit = (user: IUser) => {
    setSelectedUser(user);
    setOpenEditModal(true);
  };

  const handleDelete = async (userId: number) => {
    const result = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        setUsers((prev) => prev.filter((u) => u.id_user !== userId));
        onUserDeleted?.(userId);
        Swal.fire("Eliminado", "Usuario eliminado correctamente", "success");
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar el usuario", "error");
      }
    }
  };

  const columns: ColumnDef<IUser>[] = [
    {
      accessorKey: "username",
      header: "Usuario",
      cell: (info) => (
        <div className='flex flex-col'>
          <span className='font-semibold text-foreground'>
            {info.getValue<string>()}
          </span>
          <span className='text-xs text-muted-foreground'>
            ID: {info.row.original.id_user}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "last_login",
      header: "Último acceso",
      cell: (info) => {
        const value = info.getValue<string>();
        return (
          <div className='flex items-center gap-2'>
            <HiOutlineClock className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm'>
              {value ? new Date(value).toLocaleDateString("es-ES") : "Nunca"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Estado",
      accessorKey: "status",
      cell: ({ row }) => {
        const isActive = row.original.status === "active";
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              isActive
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}>
            {isActive ? (
              <HiOutlineCheckCircle className='h-3.5 w-3.5' />
            ) : (
              <HiOutlineXCircle className='h-3.5 w-3.5' />
            )}
            {isActive ? "Activo" : "Inactivo"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Buttons
            size='sm'
            variant='outline'
            className='inline-flex items-center gap-1.5'
            onClick={() => handleEdit(row.original)}>
            <HiOutlinePencil className='h-3.5 w-3.5' />
            Editar
          </Buttons>
          <Buttons
            size='sm'
            variant='outline'
            className='inline-flex items-center gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700'
            onClick={() => handleDelete(row.original.id_user!)}>
            <HiOutlineTrash className='h-3.5 w-3.5' />
          </Buttons>
        </div>
      ),
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-foreground'>
            Usuarios de {clientName}
          </h3>
          <p className='text-sm text-muted-foreground'>
            Gestiona los usuarios con acceso al sistema
          </p>
        </div>
        <Buttons
          size='sm'
          onClick={() => setOpenCreateModal(true)}
          className='inline-flex items-center gap-2'>
          <HiOutlinePlusCircle className='h-4 w-4' />
          Nuevo Usuario
        </Buttons>
      </div>

      <div className='grid gap-4 sm:grid-cols-3'>
        <div className='rounded-xl border border-border bg-gradient-to-br from-blue-50 to-blue-100 p-5 dark:from-blue-950 dark:to-blue-900'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-blue-900 dark:text-blue-100'>
              Total
            </span>
            <HiOutlineUser className='h-5 w-5 text-blue-600 dark:text-blue-400' />
          </div>
          <p className='mt-2 text-3xl font-bold text-blue-900 dark:text-blue-100'>
            {stats.total}
          </p>
        </div>
        <div className='rounded-xl border border-border bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 dark:from-emerald-950 dark:to-emerald-900'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-emerald-900 dark:text-emerald-100'>
              Activos
            </span>
            <HiOutlineCheckCircle className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
          </div>
          <p className='mt-2 text-3xl font-bold text-emerald-900 dark:text-emerald-100'>
            {stats.active}
          </p>
        </div>
        <div className='rounded-xl border border-border bg-gradient-to-br from-red-50 to-red-100 p-5 dark:from-red-950 dark:to-red-900'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-red-900 dark:text-red-100'>
              Inactivos
            </span>
            <HiOutlineXCircle className='h-5 w-5 text-red-600 dark:text-red-400' />
          </div>
          <p className='mt-2 text-3xl font-bold text-red-900 dark:text-red-100'>
            {stats.inactive}
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 py-16'>
          <div className='rounded-full bg-primary/10 p-4'>
            <HiOutlineUser className='h-12 w-12 text-primary' />
          </div>
          <p className='mt-4 text-lg font-semibold text-foreground'>
            No hay usuarios asignados
          </p>
          <p className='mt-1 text-sm text-muted-foreground'>
            Crea el primer usuario para dar acceso al sistema
          </p>
          <Buttons
            size='sm'
            onClick={() => setOpenCreateModal(true)}
            className='mt-6 inline-flex items-center gap-2'>
            <HiOutlinePlusCircle className='h-4 w-4' />
            Crear Primer Usuario
          </Buttons>
        </div>
      ) : (
        <div className='rounded-xl border border-border bg-card'>
          <DataTable data={users} columns={columns} />
        </div>
      )}

      <Modal
        size='md'
        title='Crear Usuario'
        open={openCreateModal}
        onOpenChange={setOpenCreateModal}>
        <UserQuickCreateForm
          clientId={clientId}
          onSuccess={(user) => {
            setUsers((prev) => [...prev, user]);
            setOpenCreateModal(false);
            onUserCreated?.(user);
            router.refresh();
          }}
          onCancel={() => setOpenCreateModal(false)}
        />
      </Modal>

      <Modal
        size='md'
        title='Editar Usuario'
        open={openEditModal}
        onOpenChange={setOpenEditModal}>
        <UserQuickEditForm
          user={selectedUser}
          onSuccess={(user) => {
            setUsers((prev) =>
              prev.map((u) => (u.id_user === user.id_user ? user : u)),
            );
            setOpenEditModal(false);
            onUserUpdated?.(user);
            router.refresh();
          }}
          onCancel={() => setOpenEditModal(false)}
        />
      </Modal>
    </div>
  );
};

interface UserQuickCreateFormProps {
  clientId: number;
  onSuccess: (user: IUser) => void;
  onCancel: () => void;
}

const UserQuickCreateForm: React.FC<UserQuickCreateFormProps> = ({
  clientId,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    status: "active",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { createUserServerAction } = await import(
        "@/app/[locale]/(protected)/account/users/actions"
      );

      const result = await createUserServerAction({
        ...formData,
        client_id: clientId,
      });

      if (result) {
        Swal.fire({
          title: "Usuario creado",
          text: "El usuario se creó correctamente",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        onSuccess(result as IUser);
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo crear el usuario",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      <div>
        <label className='block text-sm font-medium text-foreground'>
          Nombre de Usuario
        </label>
        <input
          type='text'
          required
          value={formData.username}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, username: e.target.value }))
          }
          className='mt-1.5 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
          placeholder='usuario.ejemplo'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-foreground'>
          Contraseña
        </label>
        <input
          type='password'
          required
          value={formData.password}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, password: e.target.value }))
          }
          className='mt-1.5 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
          placeholder='••••••••'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-foreground'>
          Estado
        </label>
        <select
          value={formData.status}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, status: e.target.value }))
          }
          className='mt-1.5 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'>
          <option value='active'>Activo</option>
          <option value='inactive'>Inactivo</option>
        </select>
      </div>

      <div className='flex justify-end gap-3 pt-4'>
        <Buttons
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={isSubmitting}>
          Cancelar
        </Buttons>
        <Buttons type='submit' disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear Usuario"}
        </Buttons>
      </div>
    </form>
  );
};

interface UserQuickEditFormProps {
  user: IUser | null;
  onSuccess: (user: IUser) => void;
  onCancel: () => void;
}

const UserQuickEditForm: React.FC<UserQuickEditFormProps> = ({
  user,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    password: "",
    status: user?.status || "active",
  });

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateUserServerAction(user.id_user!, formData);

      if (result) {
        Swal.fire({
          title: "Usuario actualizado",
          text: "Los cambios se guardaron correctamente",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        onSuccess({ ...user, ...formData });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el usuario",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      <div>
        <label className='block text-sm font-medium text-foreground'>
          Nombre de Usuario
        </label>
        <input
          type='text'
          required
          value={formData.username}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, username: e.target.value }))
          }
          className='mt-1.5 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-foreground'>
          Nueva Contraseña
        </label>
        <input
          type='password'
          value={formData.password}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, password: e.target.value }))
          }
          className='mt-1.5 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
          placeholder='Dejar vacío para no cambiar'
        />
        <p className='mt-1 text-xs text-muted-foreground'>
          Solo completa este campo si deseas cambiar la contraseña
        </p>
      </div>

      <div>
        <label className='block text-sm font-medium text-foreground'>
          Estado
        </label>
        <select
          value={formData.status}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, status: e.target.value }))
          }
          className='mt-1.5 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'>
          <option value='active'>Activo</option>
          <option value='inactive'>Inactivo</option>
        </select>
      </div>

      <div className='flex justify-end gap-3 pt-4'>
        <Buttons
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={isSubmitting}>
          Cancelar
        </Buttons>
        <Buttons type='submit' disabled={isSubmitting}>
          {isSubmitting ? "Actualizando..." : "Actualizar Usuario"}
        </Buttons>
      </div>
    </form>
  );
};
