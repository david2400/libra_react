/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import {
  IFormAddProps,
  IFormProps,
  IFormUpdateProps,
} from "@repo/ui/form/models";
import { FormModuleApplication } from "../scenes/formModuleApplication";
import { validationModuleApplication } from "../schemas/module-application.schema";
import {
  IModuleApplicationCreateRequest,
  IModuleApplicationUpdateRequest,
} from "../models/module-application.interface";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
// TODO: Fix server action imports for module-applications
// import { createApplicationModuleAction, updateApplicationModuleAction } from "@/server/domains/access-control/security/applications/actions";

const FormBase = ({
  initialValues,
  onSubmit,
  validationSchema,
}: IFormProps<any>) => {
  return (
    <FormModuleApplication
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    />
  );
};

export const RegisterModuleApplication = ({}: IFormAddProps = {}) => {
  const router = useRouter();
  const { useTranslations } = require('next-intl');
  const t = useTranslations('security.modulesApplications.messages');
  const tMessages = useTranslations('messages');

  const defaultValues: IModuleApplicationCreateRequest = {
    name: "",
    description: "",
    application_id: 0,
    parent_module_application_id: 0,
    publication_date: new Date(),
    level: 0,
    path: "",
  };

  const handleSubmit: SubmitHandler<IModuleApplicationCreateRequest> = async (
    values,
  ) => {
    try {
      // TODO: Implement server action call
      // const result = await createModuleApplicationServerAction(values);
      console.log('Create module application:', values);

      Swal.fire({
        title: t('createSuccess'),
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => router.refresh(),
      });
    } catch (error) {
      Swal.fire({
        title: tMessages('createError', { entity: 'módulo' }),
        text: (error as any)?.message || tMessages('unexpectedError'),
        icon: "error",
      });
    }
  };

  return (
    <FormBase
      initialValues={defaultValues}
      onSubmit={handleSubmit}
      validationSchema={validationModuleApplication()}
    />
  );
};

export const UpdateModuleApplication = ({
  initialValues,
}: IFormUpdateProps<IModuleApplicationUpdateRequest>) => {
  const router = useRouter();
  const { useTranslations } = require('next-intl');
  const t = useTranslations('security.modulesApplications.messages');
  const tMessages = useTranslations('messages');

  const handleSubmit: SubmitHandler<IModuleApplicationUpdateRequest> = async (
    values,
  ) => {
    if (!values.id_modules_application) return;

    try {
      // TODO: Implement server action call
      // const result = await updateModuleApplicationServerAction(values.id_modules_application, values);
      console.log('Update module application:', values);

      Swal.fire({
        title: t('updateSuccess'),
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => router.refresh(),
      });
    } catch (error) {
      Swal.fire({
        title: tMessages('updateError', { entity: 'módulo' }),
        text: (error as any)?.message || tMessages('unexpectedError'),
        icon: "error",
      });
    }
  };

  if (!initialValues) return null;

  return (
    <FormBase
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationModuleApplication()}
    />
  );
};
