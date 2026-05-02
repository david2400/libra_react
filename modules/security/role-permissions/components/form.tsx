/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import { IFormAddProps, IFormProps, IFormUpdateProps } from "@repo/ui/form/models/form.interface";
import { FormRolePermission } from "../scenes/formRolePermission";
import { validationRolePermission } from "../schemas/role-permission.schema";
import { IRolePermissionCreateRequest, IRolePermissionUpdateRequest } from "../models/role-permission.interface";
import { rolePermissions } from "@/server/domains/access-control/security";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const FormBase = ({ initialValues, onSubmit, validationSchema }: IFormProps<any>) => {
  return <FormRolePermission initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema} />;
};

export const RegisterRolePermission = ({}: IFormAddProps = {}) => {
  const router = useRouter();

  const defaultValues: IRolePermissionCreateRequest = {
    roleId: 0,
    permissionId: 0,
    isActive: true,
  };

  const handleSubmit: SubmitHandler<IRolePermissionCreateRequest> = async (values) => {
    const result = await rolePermissions.create_role_permission_action(values);
    
    if (result.success) {
      Swal.fire({
        title: "Asignación creada exitosamente",
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

  return <FormBase initialValues={defaultValues} onSubmit={handleSubmit} validationSchema={validationRolePermission()} />;
};

export const UpdateRolePermission = ({ initialValues }: IFormUpdateProps<IRolePermissionUpdateRequest>) => {
  const router = useRouter();

  const handleSubmit: SubmitHandler<IRolePermissionUpdateRequest> = async (values) => {
    if (!values.roleId || !values.permissionId) return;
    
    const result = await rolePermissions.update_role_permission_action(values.roleId, values.permissionId, values);
    
    if (result.success) {
      Swal.fire({
        title: "Asignación actualizada exitosamente",
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

  return <FormBase initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationRolePermission()} />;
};
