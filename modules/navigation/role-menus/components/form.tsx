/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import { IFormAddProps, IFormProps, IFormUpdateProps } from "@repo/ui/form/models/form.interface";
import { FormRoleMenu } from "../scenes/formRoleMenu";
import { validationRoleMenu } from "../schemas/role-menu.schema";
import { IRoleMenuCreateRequest, IRoleMenuUpdateRequest } from "../models/role-menu.interface";
import { roleMenus } from "@/server/domains/access-control/navigation";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const FormBase = ({ initialValues, onSubmit, validationSchema }: IFormProps<any>) => {
  return <FormRoleMenu initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema} />;
};

export const RegisterRoleMenu = ({}: IFormAddProps = {}) => {
  const router = useRouter();

  const defaultValues: IRoleMenuCreateRequest = {
    roleId: 0,
    menuId: 0,
    isActive: true,
    canView: true,
    canEdit: false,
  };

  const handleSubmit: SubmitHandler<IRoleMenuCreateRequest> = async (values) => {
    const result = await roleMenus.create_role_menu_action(values);
    
    if (result.success) {
      Swal.fire({
        title: "Menú asignado exitosamente",
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

  return <FormBase initialValues={defaultValues} onSubmit={handleSubmit} validationSchema={validationRoleMenu()} />;
};

export const UpdateRoleMenu = ({ initialValues }: IFormUpdateProps<IRoleMenuUpdateRequest>) => {
  const router = useRouter();

  const handleSubmit: SubmitHandler<IRoleMenuUpdateRequest> = async (values) => {
    if (!values.roleId || !values.menuId) return;
    
    const result = await roleMenus.update_role_menu_action(values.roleId, values.menuId, values);
    
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

  return <FormBase initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationRoleMenu()} />;
};
