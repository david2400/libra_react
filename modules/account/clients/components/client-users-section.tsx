// /** @format */

// "use client";

// import React, { useState } from "react";
// import { useTranslations } from "next-intl";
// import { ColumnDef } from "@tanstack/react-table";
// import { Modal } from "@repo/ui/modals/scenes";
// import { Buttons } from "@repo/ui/buttons/scenes";
// import { DataTable } from "@repo/ui/table/scenes";
// import {
//   HiOutlineUser,
//   HiOutlinePlusCircle,
//   HiOutlineTrash,
// } from "react-icons/hi2";
// import { IUser } from "@/modules/account/users/models/user.interface";
// import { useClientUsers } from "../hooks/use-client-users";

// /**
//  * Componente para gestionar usuarios de un cliente específico
//  * Principio: Single Responsibility - Solo maneja la UI de usuarios del cliente
//  * Principio: Open/Closed - Extensible mediante props sin modificar el componente
//  */
// interface ClientUsersSectionProps {
//   clientId: number;
//   clientName: string;
//   initialUsers?: IUser[];
//   onUserCreated?: (user: IUser) => void;
//   onUserUpdated?: (user: IUser) => void;
//   onUserDeleted?: (userId: number) => void;
// }

// export const ClientUsersSection: React.FC<ClientUsersSectionProps> = ({
//   clientId,
//   clientName,
//   initialUsers = [],
//   onUserCreated,
//   onUserUpdated,
//   onUserDeleted,
// }) => {
//   const t = useTranslations("account.users");
//   const tCommon = useTranslations("common");

//   const [openCreateModal, setOpenCreateModal] = useState(false);
//   const [openEditModal, setOpenEditModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

//   const { users, stats, isLoading, toggleUserStatus, removeUser } =
//     useClientUsers(clientId, initialUsers);

//   const handleEdit = (user: IUser) => {
//     setSelectedUser(user);
//     setOpenEditModal(true);
//   };

//   const handleDelete = async (userId: number) => {
//     if (confirm(t("confirmDelete"))) {
//       removeUser(userId);
//       onUserDeleted?.(userId);
//     }
//   };

//   const columns: ColumnDef<IUser>[] = [
//     {
//       accessorKey: "username",
//       header: t("fields.username"),
//       cell: (info) => (
//         <div className='flex flex-col'>
//           <span className='font-semibold text-foreground'>
//             {info.getValue<string>()}
//           </span>
//           <span className='text-xs text-muted-foreground'>
//             {info.row.original.status || "active"}
//           </span>
//         </div>
//       ),
//     },
//     {
//       accessorKey: "last_login",
//       header: "Último acceso",
//       cell: (info) => {
//         const value = info.getValue<string>();
//         return (
//           <span className='text-sm'>
//             {value ? new Date(value).toLocaleDateString() : "-"}
//           </span>
//         );
//       },
//     },
//     {
//       header: tCommon("status"),
//       accessorKey: "status",
//       cell: ({ row }) => (
//         <span
//           className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
//             row.original.status === "active"
//               ? "bg-green-100 text-green-800"
//               : "bg-red-100 text-red-800"
//           }`}>
//           {row.original.status === "active"
//             ? tCommon("active")
//             : tCommon("inactive")}
//         </span>
//       ),
//     },
//     {
//       id: "actions",
//       header: tCommon("actions"),
//       cell: ({ row }) => (
//         <div className='flex items-center gap-2'>
//           <Buttons
//             size='sm'
//             variant='outline'
//             onClick={() => handleEdit(row.original)}>
//             {tCommon("edit")}
//           </Buttons>
//           <Buttons
//             size='sm'
//             variant='outline'
//             color='danger'
//             onClick={() => handleDelete(row.original.id_user!)}>
//             <HiOutlineTrash className='h-4 w-4' />
//           </Buttons>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className='space-y-4'>
//       {/* Header */}
//       <div className='flex items-center justify-between'>
//         <div>
//           <h3 className='text-lg font-semibold text-foreground'>
//             Usuarios de {clientName}
//           </h3>
//           <p className='text-sm text-muted-foreground'>
//             Gestiona los usuarios asociados a este cliente
//           </p>
//         </div>
//         <Buttons
//           size='sm'
//           onClick={() => setOpenCreateModal(true)}
//           className='inline-flex items-center gap-2'>
//           <HiOutlinePlusCircle className='h-4 w-4' />
//           Agregar Usuario
//         </Buttons>
//       </div>

//       {/* Stats Cards */}
//       <div className='grid gap-4 sm:grid-cols-3'>
//         <div className='rounded-lg border border-border bg-card p-4'>
//           <div className='flex items-center justify-between'>
//             <span className='text-sm font-medium text-muted-foreground'>
//               Total
//             </span>
//             <HiOutlineUser className='h-5 w-5 text-muted-foreground' />
//           </div>
//           <p className='mt-2 text-2xl font-semibold text-foreground'>
//             {stats.total}
//           </p>
//         </div>
//         <div className='rounded-lg border border-border bg-card p-4'>
//           <div className='flex items-center justify-between'>
//             <span className='text-sm font-medium text-muted-foreground'>
//               Activos
//             </span>
//             <HiOutlineUser className='h-5 w-5 text-green-600' />
//           </div>
//           <p className='mt-2 text-2xl font-semibold text-green-600'>
//             {stats.active}
//           </p>
//         </div>
//         <div className='rounded-lg border border-border bg-card p-4'>
//           <div className='flex items-center justify-between'>
//             <span className='text-sm font-medium text-muted-foreground'>
//               Inactivos
//             </span>
//             <HiOutlineUser className='h-5 w-5 text-red-600' />
//           </div>
//           <p className='mt-2 text-2xl font-semibold text-red-600'>
//             {stats.inactive}
//           </p>
//         </div>
//       </div>

//       {/* Users Table */}
//       {isLoading ? (
//         <div className='flex items-center justify-center py-8'>
//           <p className='text-muted-foreground'>Cargando usuarios...</p>
//         </div>
//       ) : users.length === 0 ? (
//         <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12'>
//           <HiOutlineUser className='h-12 w-12 text-muted-foreground' />
//           <p className='mt-4 text-sm font-medium text-foreground'>
//             No hay usuarios asignados
//           </p>
//           <p className='mt-1 text-sm text-muted-foreground'>
//             Agrega usuarios para que puedan acceder al sistema
//           </p>
//           <Buttons
//             size='sm'
//             onClick={() => setOpenCreateModal(true)}
//             className='mt-4 inline-flex items-center gap-2'>
//             <HiOutlinePlusCircle className='h-4 w-4' />
//             Agregar primer usuario
//           </Buttons>
//         </div>
//       ) : (
//         <DataTable
//           data={users}
//           columns={columns}
//           className='rounded-lg border'
//         />
//       )}

//       {/* Modals */}
//       <Modal
//         size='md'
//         title='Crear usuario'
//         open={openCreateModal}
//         onOpenChange={setOpenCreateModal}>
//         <UserQuickCreateForm
//           clientId={clientId}
//           onSuccess={(user) => {
//             setOpenCreateModal(false);
//             onUserCreated?.(user);
//           }}
//           onCancel={() => setOpenCreateModal(false)}
//         />
//       </Modal>

//       <Modal
//         size='md'
//         title='Editar usuario'
//         open={openEditModal}
//         onOpenChange={setOpenEditModal}>
//         <UserQuickEditForm
//           user={selectedUser}
//           onSuccess={(user) => {
//             setOpenEditModal(false);
//             onUserUpdated?.(user);
//           }}
//           onCancel={() => setOpenEditModal(false)}
//         />
//       </Modal>
//     </div>
//   );
// };

// /**
//  * Formulario rápido para crear usuarios
//  * Principio: Single Responsibility - Solo maneja la creación de usuarios
//  */
// interface UserQuickCreateFormProps {
//   clientId: number;
//   onSuccess: (user: IUser) => void;
//   onCancel: () => void;
// }

// const UserQuickCreateForm: React.FC<UserQuickCreateFormProps> = ({
//   clientId,
//   onSuccess,
//   onCancel,
// }) => {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [formData, setFormData] = useState({
//     username: "",
//     password: "",
//     status: "active",
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       // Importación dinámica para evitar problemas de next/headers
//       const { createUserAction } = await import(
//         "@/app/[locale]/(protected)/account/users/actions"
//       );

//       const result = await createUserAction({
//         ...formData,
//         client_id: clientId,
//       });

//       if (result) {
//         onSuccess(result as IUser);
//       }
//     } catch (error) {
//       console.error("Error creating user:", error);
//       alert("Error al crear el usuario");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className='space-y-4'>
//       <div>
//         <label className='block text-sm font-medium text-foreground'>
//           Usuario
//         </label>
//         <input
//           type='text'
//           required
//           value={formData.username}
//           onChange={(e) =>
//             setFormData((prev) => ({ ...prev, username: e.target.value }))
//           }
//           className='mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
//           placeholder='nombre.usuario'
//         />
//       </div>

//       <div>
//         <label className='block text-sm font-medium text-foreground'>
//           Contraseña
//         </label>
//         <input
//           type='password'
//           required
//           value={formData.password}
//           onChange={(e) =>
//             setFormData((prev) => ({ ...prev, password: e.target.value }))
//           }
//           className='mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
//           placeholder='••••••••'
//         />
//       </div>

//       <div>
//         <label className='block text-sm font-medium text-foreground'>
//           Estado
//         </label>
//         <select
//           value={formData.status}
//           onChange={(e) =>
//             setFormData((prev) => ({ ...prev, status: e.target.value }))
//           }
//           className='mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'>
//           <option value='active'>Activo</option>
//           <option value='inactive'>Inactivo</option>
//         </select>
//       </div>

//       <div className='flex justify-end gap-2 pt-4'>
//         <Buttons
//           type='button'
//           variant='outline'
//           onClick={onCancel}
//           disabled={isSubmitting}>
//           Cancelar
//         </Buttons>
//         <Buttons type='submit' disabled={isSubmitting}>
//           {isSubmitting ? "Creando..." : "Crear Usuario"}
//         </Buttons>
//       </div>
//     </form>
//   );
// };

// /**
//  * Formulario rápido para editar usuarios
//  */
// interface UserQuickEditFormProps {
//   user: IUser | null;
//   onSuccess: (user: IUser) => void;
//   onCancel: () => void;
// }

// const UserQuickEditForm: React.FC<UserQuickEditFormProps> = ({
//   user,
//   onSuccess,
//   onCancel,
// }) => {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [formData, setFormData] = useState({
//     username: user?.username || "",
//     status: user?.status || "active",
//   });

//   if (!user) return null;

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       const { updateUserAction } = await import(
//         "@/app/[locale]/(protected)/account/users/actions"
//       );

//       const result = await updateUserAction(user.id_user!, formData);

//       if (result) {
//         onSuccess(result as IUser);
//       }
//     } catch (error) {
//       console.error("Error updating user:", error);
//       alert("Error al actualizar el usuario");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className='space-y-4'>
//       <div>
//         <label className='block text-sm font-medium text-foreground'>
//           Usuario
//         </label>
//         <input
//           type='text'
//           required
//           value={formData.username}
//           onChange={(e) =>
//             setFormData((prev) => ({ ...prev, username: e.target.value }))
//           }
//           className='mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
//         />
//       </div>

//       <div>
//         <label className='block text-sm font-medium text-foreground'>
//           Estado
//         </label>
//         <select
//           value={formData.status}
//           onChange={(e) =>
//             setFormData((prev) => ({ ...prev, status: e.target.value }))
//           }
//           className='mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'>
//           <option value='active'>Activo</option>
//           <option value='inactive'>Inactivo</option>
//         </select>
//       </div>

//       <div className='flex justify-end gap-2 pt-4'>
//         <Buttons
//           type='button'
//           variant='outline'
//           onClick={onCancel}
//           disabled={isSubmitting}>
//           Cancelar
//         </Buttons>
//         <Buttons type='submit' disabled={isSubmitting}>
//           {isSubmitting ? "Actualizando..." : "Actualizar Usuario"}
//         </Buttons>
//       </div>
//     </form>
//   );
// };
