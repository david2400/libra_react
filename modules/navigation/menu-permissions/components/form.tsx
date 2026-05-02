/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import { IFormAddProps, IFormProps, IFormUpdateProps } from "@repo/ui/form/models/form.interface";
import { FormMenuPermission } from "../scenes/formMenuPermission";
import { validationMenuPermission } from "../schemas/menu-permission.schema";
import { IMenuPermissionCreateRequest, IMenuPermissionUpdateRequest } from "../models/menu-permission.interface";
import { menuPermissions } from "@/server/domains/access-control/navigation";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const FormBase = ({ initialValues, onSubmit, validationSchema }: IFormProps<any>) => {
  return <FormMenuPermission initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema} />;
};

export const RegisterMenuPermission = ({}: IFormAddProps = {}) => {
  const router = useRouter();

  const defaultValues: IMenuPermissionCreateRequest = {
    menuId: 0,
    permissionId: 0,
    isActive: true,
  };

  const handleSubmit: SubmitHandler<IMenuPermissionCreateRequest> = async (values) => {
    const result = await menuPermissions.create_menu_permission_action(values);
    
    if (result.success) {
      Swal.fire({
        title: "Permiso asignado exitosamente",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => router.refresh(),
      });
    } else {
      Swal.fire({
        title: "Error!",
        text: result.error?.message || "Ocurrió un error inesperado",
        icon: "error",
      });
    }
  };

  return <FormBase initialValues={defaultValues} onSubmit={handleSubmit} validationSchema={validationMenuPermission()} />;
};

export const UpdateMenuPermission = ({ initialValues }: IFormUpdateProps<IMenuPermissionUpdateRequest>) => {
  const router = useRouter();

  const handleSubmit: SubmitHandler<IMenuPermissionUpdateRequest> = async (values) => {
    if (!values.menuId || !values.permissionId) return;
    
    const result = await menuPermissions.update_menu_permission_action(values.menuId, values.permissionId, values);
    
    if (result.success) {
      Swal.fire({
        title: "Permiso actualizado exitosamente",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => router.refresh(),
      });
    } else {
      Swal.fire({
        title: "Error!",
        text: result.error?.message || "Ocurrió un error inesperado",
        icon: "error",
      });
    }
  };

  if (!initialValues) return null;

  return <FormBase initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationMenuPermission()} />;
};
