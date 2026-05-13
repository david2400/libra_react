/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import {
  IFormAddProps,
  IFormProps,
  IFormUpdateProps,
} from "@repo/ui/form/models";
import { FormApplication } from "../scenes/formApplication";
import { validationApplication } from "../schemas/application.schema";
import {
  IApplicationCreateRequest,
  IApplicationUpdateRequest,
} from "../models/application.interface";
import { applicationsApi } from "@/lib/api";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const FormBase = ({
  initialValues,
  onSubmit,
  validationSchema,
}: IFormProps<any>) => {
  return (
    <FormApplication
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    />
  );
};

export const RegisterApplication = ({}: IFormAddProps = {}) => {
  const router = useRouter();
  const { useTranslations } = require('next-intl');
  const t = useTranslations('security.applications.messages');
  const tMessages = useTranslations('messages');

  const defaultValues: IApplicationCreateRequest = {
    name: "",
    description: "",
    version: "",
    status: "active",
    baseUrl: "",
  };

  const handleSubmit: SubmitHandler<IApplicationCreateRequest> = async (values) => {
    try {
      const result = await applicationsApi.create(values);
      
      Swal.fire({
        title: t('createSuccess'),
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => {
          router.refresh();
        },
      });
    } catch (error) {
      Swal.fire({
        title: tMessages('createError', { entity: 'aplicación' }),
        text: (error as any)?.message || tMessages('unexpectedError'),
        icon: "error",
      });
    }
  };

  return (
    <FormBase
      initialValues={defaultValues}
      onSubmit={handleSubmit}
      validationSchema={validationApplication()}
    />
  );
};

export const UpdateApplication = ({
  initialValues,
}: IFormUpdateProps<IApplicationUpdateRequest>) => {
  const router = useRouter();
  const { useTranslations } = require('next-intl');
  const t = useTranslations('security.applications.messages');
  const tMessages = useTranslations('messages');

  const handleSubmit: SubmitHandler<IApplicationUpdateRequest> = async (values) => {
    if (!values.id) return;
    
    try {
      const result = await applicationsApi.update(values.id, values);
      
      Swal.fire({
        title: t('updateSuccess'),
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => {
          router.refresh();
        },
      });
    } catch (error) {
      Swal.fire({
        title: tMessages('updateError', { entity: 'aplicación' }),
        text: (error as any)?.message || tMessages('unexpectedError'),
        icon: "error",
      });
    }
  };

  if (!initialValues) {
    return null;
  }

  return (
    <FormBase
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationApplication()}
    />
  );
};
