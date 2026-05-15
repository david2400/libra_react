/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import { IFormAddProps, IFormProps, IFormUpdateProps } from "@repo/ui/form/models";
import { FormRoleMenu } from "../scenes/formRoleMenu";
import { validationRoleMenu } from "../schemas/role-menu.schema";
import { IRoleMenuCreateRequest, IRoleMenuUpdateRequest } from "../models/role-menu.interface";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { createRoleMenuAction, updateRoleMenuAction } from "../api/actions";

const FormBase = ({ initialValues, onSubmit, validationSchema }: IFormProps<any>) => {
  return <FormRoleMenu initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema} />;
};

export const RegisterRoleMenu = ({}: IFormAddProps = {}) => {
  const router = useRouter();
  const { useTranslations } = require('next-intl');
  const t = useTranslations('navigation.roleMenus.messages');
  const tMessages = useTranslations('messages');

  const defaultValues: IRoleMenuCreateRequest = {
    roleId: 0,
    menuId: 0,
    isActive: true,
    canView: true,
    canEdit: false,
  };

  const handleSubmit: SubmitHandler<IRoleMenuCreateRequest> = async (values) => {
    try {
      const result = await createRoleMenuAction(values.roleId, values.menuId, values);
      
      Swal.fire({
        title: t('createSuccess'),
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => router.refresh(),
      });
    } catch (error) {
      Swal.fire({
        title: tMessages('createError', { entity: 'menú de rol' }),
        text: (error as any)?.message || tMessages('unexpectedError'),
        icon: "error",
      });
    }
  };

  return <FormBase initialValues={defaultValues} onSubmit={handleSubmit} validationSchema={validationRoleMenu()} />;
};

export const UpdateRoleMenu = ({ initialValues }: IFormUpdateProps<IRoleMenuUpdateRequest>) => {
  const router = useRouter();
  const { useTranslations } = require('next-intl');
  const t = useTranslations('navigation.roleMenus.messages');
  const tMessages = useTranslations('messages');

  const handleSubmit: SubmitHandler<IRoleMenuUpdateRequest> = async (values) => {
    if (!values.roleId || !values.menuId) return;
    
    try {
      const result = await updateRoleMenuAction(
        values.roleId,
        values.menuId,
        values,
      );
      
      Swal.fire({
        title: t('updateSuccess'),
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => router.refresh(),
      });
    } catch (error) {
      Swal.fire({
        title: tMessages('updateError', { entity: 'menú de rol' }),
        text: (error as any)?.message || tMessages('unexpectedError'),
        icon: "error",
      });
    }
  };

  if (!initialValues) return null;

  return <FormBase initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationRoleMenu()} />;
};
