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
import { companyApplicationsClientApi } from "../api/client-api";
import { createCompanyApplicationServerAction, updateCompanyApplicationServerAction } from "@/app/[locale]/(protected)/security/company-applications/actions";


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

export const RegisterCompanyApplication = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
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
    try {
      await createCompanyApplicationServerAction(values);
      Swal.fire({
        title: t("createSuccess"),
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => {
          onSuccess?.();
          router.refresh();
        },
      });
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.message || "Ocurrió un error inesperado",
        icon: "error",
      });
    }
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
    if (!values.id_company_application) return;

    try {
      await updateCompanyApplicationServerAction(
        values.id_company_application,
        values,
      );
      Swal.fire({
        title: t("updateSuccess"),
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => {
          router.refresh();
        },
      });
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.message || "Ocurrió un error inesperado",
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
