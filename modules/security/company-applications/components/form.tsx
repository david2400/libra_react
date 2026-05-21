/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import {
  IFormAddProps,
  IFormProps,
  IFormUpdateProps,
} from "@repo/ui/form/models";
import { FormCompanyApplication } from "../scenes/formCompanyApplication";
import { validationCompanyApplication } from "../schemas/company-application.schema";
import {
  ICompanyApplicationCreateRequest,
  ICompanyApplicationUpdateRequest,
} from "../models/company-application.interface";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { createCompanyApplicationAction, updateCompanyApplicationAction } from "@/server/domains/access-control/security/company_applications";


const FormBase = ({
  initialValues,
  onSubmit,
  validationSchema,
}: IFormProps<any>) => {
  return (
    <FormCompanyApplication
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    />
  );
};

export const RegisterCompanyApplication = ({}: IFormAddProps = {}) => {
  const router = useRouter();
  const { useTranslations } = require("next-intl");
  const t = useTranslations("security.companyApplications.messages");
  const tMessages = useTranslations("messages");

  const defaultValues: ICompanyApplicationCreateRequest = {
    company_id: 0,
    application_id: 0,
    license_start_date: "",
    license_end_date: "",
    is_active: true,
    user_limit: undefined,
    subscription_type: "",
    auto_renew: false,
    notes: "",
  };

  const handleSubmit: SubmitHandler<ICompanyApplicationCreateRequest> = async (
    values,
  ) => {
    const result = await createCompanyApplicationAction(values)
      .then((result) => {
        Swal.fire({
          title: t("createSuccess"),
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
          willClose: () => router.refresh(),
        });
      })
      .catch((error) => {
        Swal.fire({
          title: "Error!",
          text: error.message || "Ocurrió un error inesperado",
          icon: "error",
        });
      });
  };

  return (
    <FormBase
      initialValues={defaultValues}
      onSubmit={handleSubmit}
      validationSchema={validationCompanyApplication()}
    />
  );
};

export const UpdateCompanyApplication = ({
  initialValues,
}: IFormUpdateProps<ICompanyApplicationUpdateRequest>) => {
  const router = useRouter();
  const { useTranslations } = require("next-intl");
  const t = useTranslations("security.companyApplications.messages");
  const tMessages = useTranslations("messages");

  const handleSubmit: SubmitHandler<ICompanyApplicationUpdateRequest> = async (
    values,
  ) => {
    if (!values.id) return;

    try {
      const result = await updateCompanyApplicationAction(values.id, values);

      if (result.success) {
        Swal.fire({
          title: t("updateSuccess"),
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
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: (error as any)?.message || "Ocurrió un error inesperado",
        icon: "error",
      });
    }
  };

  if (!initialValues) return null;

  return (
    <FormBase
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationCompanyApplication()}
    />
  );
};
