/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import { IFormAddProps, IFormProps, IFormUpdateProps } from "@repo/ui/form/models";
import { FormClient } from "../scenes/formClient";
import { validationClient } from "../schemas/client.schema";
import { IClientCreateRequest, IClientUpdateRequest } from "../models/client.interface";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClientServerAction } from "@/app/[locale]/(protected)/account/clients/actions";

const FormBase = ({ initialValues, onSubmit, validationSchema }: IFormProps<any>) => {
  return <FormClient initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema} />;
};

export const RegisterClient = ({}: IFormAddProps = {}) => {
  const router = useRouter();
  const { useTranslations } = require('next-intl');
  const t = useTranslations('account.clients.messages');
  const tMessages = useTranslations('messages');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: IClientCreateRequest = {
    first_name: "",
    second_name: "",
    first_last_name: "",
    second_last_name: "",
    type_id: "CC",
    card_id: "",
    sex: "M",
    gender: "Masculino",
    status: "Activo",
  };

  const handleSubmit: SubmitHandler<IClientCreateRequest> = async (values) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Importación dinámica de server action
   
      const result = await createClientServerAction(values);
      
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return <FormBase initialValues={defaultValues} onSubmit={handleSubmit} validationSchema={validationClient()} />;
};

export const UpdateClient = ({ initialValues }: IFormUpdateProps<IClientUpdateRequest>) => {
  const router = useRouter();
  const { useTranslations } = require('next-intl');
  const t = useTranslations('account.clients.messages');
  const tMessages = useTranslations('messages');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit: SubmitHandler<IClientUpdateRequest> = async (values) => {
    if (!values.id_client || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Importación dinámica de server action
      const { updateClientServerAction } = await import(
        "@/app/[locale]/(protected)/account/clients/actions"
      );
      
      const result = await updateClientServerAction(values.id_client, values);
      
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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialValues) return null;

  return <FormBase initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationClient()} />;
};
