/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import { IFormAddProps, IFormProps, IFormUpdateProps } from "@repo/ui/form/models";
import { FormClient } from "../scenes/formClient";
import { validationClient } from "../schemas/client.schema";
import { IClientCreateRequest, IClientUpdateRequest } from "../models/client.interface";
import { clientsApi } from "@/lib/api";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const FormBase = ({ initialValues, onSubmit, validationSchema }: IFormProps<any>) => {
  return <FormClient initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema} />;
};

export const RegisterClient = ({}: IFormAddProps = {}) => {
  const router = useRouter();
  const { useTranslations } = require('next-intl');
  const t = useTranslations('account.clients.messages');
  const tMessages = useTranslations('messages');

  const defaultValues: IClientCreateRequest = {
    name: "",
    email: "",
    phone: "",
  };

  const handleSubmit: SubmitHandler<IClientCreateRequest> = async (values) => {
    try {
      const result = await clientsApi.create(values);
      
      Swal.fire({
        title: t('createSuccess'),
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => router.refresh(),
      });
    } catch (error) {
      Swal.fire({
        title: tMessages('createError', { entity: 'cliente' }),
        text: (error as any)?.message || tMessages('unexpectedError'),
        icon: "error",
      });
    }
  };

  return <FormBase initialValues={defaultValues} onSubmit={handleSubmit} validationSchema={validationClient()} />;
};

export const UpdateClient = ({ initialValues }: IFormUpdateProps<IClientUpdateRequest>) => {
  const router = useRouter();
  const { useTranslations } = require('next-intl');
  const t = useTranslations('account.clients.messages');
  const tMessages = useTranslations('messages');

  const handleSubmit: SubmitHandler<IClientUpdateRequest> = async (values) => {
    if (!values.id) return;
    
    try {
      const result = await clientsApi.update(values.id, values);
      
      Swal.fire({
        title: t('updateSuccess'),
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => router.refresh(),
      });
    } catch (error) {
      Swal.fire({
        title: tMessages('updateError', { entity: 'cliente' }),
        text: (error as any)?.message || tMessages('unexpectedError'),
        icon: "error",
      });
    }
  };

  if (!initialValues) return null;

  return <FormBase initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationClient()} />;
};
