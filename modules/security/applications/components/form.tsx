/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import {
  IFormAddProps,
  IFormProps,
  IFormUpdateProps,
} from "@repo/ui/form/models";
import { FormApplication } from "../scenes/formApplication";
import {
  validationApplication,
  validationUpdateApplication,
} from "../schemas/application.schema";
import {
  IApplicationCreateRequest,
  IApplicationUpdateRequest,
} from "../models/application.interface";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

import { useTranslations } from "next-intl";
import {
  createApplicationServerAction,
  updateApplicationServerAction,
} from "@/app/[locale]/(protected)/security/applications/actions";

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

export const RegisterApplication = ({ }: IFormAddProps = {}) => {
  const router = useRouter();
  const { useTranslations } = require("next-intl");
  const t = useTranslations("security.applications.messages");
  const tMessages = useTranslations("messages");

  const defaultValues: IApplicationCreateRequest = {
    name: "",
    description: "",
    publication_date: "",
    maintenance_mode: false,
    application_category_id: null
  };

  const handleSubmit: SubmitHandler<IApplicationCreateRequest> = async (
    values,
  ) => {
    try {
      const result = await createApplicationServerAction(values);

      await Swal.fire({
        title: t("createSuccess"),
        icon: "success",
        timer: 3000,
        showConfirmButton: true,
      });

      router.refresh();
    } catch (error) {
      Swal.fire({
        title: tMessages("createError", { entity: "aplicación" }),
        text: (error as any)?.message || tMessages("unexpectedError"),
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
  handleClose,
}: IFormUpdateProps<IApplicationUpdateRequest>) => {
  const router = useRouter();
  const t = useTranslations("security.applications.messages");
  const tMessages = useTranslations("messages");

  const handleSubmit: SubmitHandler<IApplicationUpdateRequest> = async (
    values,
  ) => {
    try {
      const id = initialValues?.id_application;
      if (!id) return;

      const result = await updateApplicationServerAction(
        id,
        values,
      )
      await Swal.fire({
        title: t("updateSuccess"),
        icon: "success",
        timer: 3000,
        showConfirmButton: true,
      });

      router.refresh();
    } catch (error) {
      Swal.fire({
        title: tMessages("updateError", { entity: "aplicación" }),
        text: (error as any)?.message || tMessages("unexpectedError"),
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
      validationSchema={validationUpdateApplication()}
    />
  );
};
