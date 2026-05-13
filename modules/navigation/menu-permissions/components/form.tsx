/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import { IFormAddProps, IFormProps, IFormUpdateProps } from "@repo/ui/form/models";
import { FormMenuPermission } from "../scenes/formMenuPermission";
import { validationMenuPermission } from "../schemas/menu-permission.schema";
import { IMenuPermissionCreateRequest, IMenuPermissionUpdateRequest } from "../models/menu-permission.interface";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { createMenuPermissionAction } from "@/server/domains/access-control/navigation/menu_permissions";

const FormBase = ({ initialValues, onSubmit, validationSchema }: IFormProps<any>) => {
  return <FormMenuPermission initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema} />;
};

export const RegisterMenuPermission = ({}: IFormAddProps = {}) => {
  const router = useRouter();
  const { useTranslations } = require('next-intl');
  const t = useTranslations('navigation.menuPermissions.messages');
  const tMessages = useTranslations('messages');

  const defaultValues: IMenuPermissionCreateRequest = {
    menuId: 0,
    permissionId: 0,
    isActive: true,
  };

  const handleSubmit: SubmitHandler<IMenuPermissionCreateRequest> = async (values) => {
    try {
      const result = await createMenuPermissionAction(values.menuId, values.permissionId, values);
      
      Swal.fire({
        title: t('createSuccess'),
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => router.refresh(),
      });
    } catch (error) {
      Swal.fire({
        title: tMessages('createError', { entity: 'permiso de menú' }),
        text: (error as any)?.message || tMessages('unexpectedError'),
        icon: "error",
      });
    }
  };

  return <FormBase initialValues={defaultValues} onSubmit={handleSubmit} validationSchema={validationMenuPermission()} />;
};

export const UpdateMenuPermission = ({ initialValues }: IFormUpdateProps<IMenuPermissionUpdateRequest>) => {
  const router = useRouter();
  const { useTranslations } = require('next-intl');
  const t = useTranslations('navigation.menuPermissions.messages');
  const tMessages = useTranslations('messages');

  const handleSubmit: SubmitHandler<IMenuPermissionUpdateRequest> = async (values) => {
    if (!values.menuId || !values.permissionId) return;
    
    try {
      const result = await menuPermissionsApi.update(values.menuId, values.permissionId, values);
      
      Swal.fire({
        title: t('updateSuccess'),
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => router.refresh(),
      });
    } catch (error) {
      Swal.fire({
        title: tMessages('updateError', { entity: 'permiso de menú' }),
        text: (error as any)?.message || tMessages('unexpectedError'),
        icon: "error",
      });
    }
  };

  if (!initialValues) return null;

  return <FormBase initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationMenuPermission()} />;
};
