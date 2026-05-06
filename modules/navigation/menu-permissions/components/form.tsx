/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import { IFormAddProps, IFormProps, IFormUpdateProps } from "@repo/ui/form/models/form.interface";
import { FormMenuPermission } from "../scenes/formMenuPermission";
import { validationMenuPermission } from "../schemas/menu-permission.schema";
import { IMenuPermissionCreateRequest, IMenuPermissionUpdateRequest } from "../models/menu-permission.interface";
import { menuPermissionsApi } from "@/lib/api";
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
    try {
      const result = await menuPermissionsApi.create(values.menuId, values.permissionId, values);
      
      Swal.fire({
        title: "Permiso asignado exitosamente",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => router.refresh(),
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: (error as any)?.message || "Ocurrió un error inesperado",
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
    
    try {
      const result = await menuPermissionsApi.update(values.menuId, values.permissionId, values);
      
      Swal.fire({
        title: "Permiso actualizado exitosamente",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => router.refresh(),
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: (error as any)?.message || "Ocurrió un error inesperado",
        icon: "error",
      });
    }
  };

  if (!initialValues) return null;

  return <FormBase initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationMenuPermission()} />;
};
