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
import {
  createApplicationAction,
  updateApplicationAction,
} from "../api/actions";
import { useTranslations } from "next-intl";

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
  const { useTranslations } = require("next-intl");
  const t = useTranslations("security.applications.messages");
  const tMessages = useTranslations("messages");

  const defaultValues: IApplicationCreateRequest = {
    name: "",
    description: "",
    route: "",
    publication_date: "",
    company_id: undefined,
    maintenance_mode: false,
  };

  const handleSubmit: SubmitHandler<IApplicationCreateRequest> = async (
    values,
  ) => {
    try {
      const result = await createApplicationAction(values);

      Swal.fire({
        title: t("createSuccess"),
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => {
          router.refresh();
        },
      });
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

  console.log("row", initialValues);
  const handleSubmit: SubmitHandler<IApplicationUpdateRequest> = async (
    values,
  ) => {
    if (!values.id_application) return;

    const result = await updateApplicationAction(values.id_application, values)
      .then((values) => {
        Swal.fire({
          title: t("updateSuccess"),
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
          willClose: () => {
            handleClose && handleClose(false);
            router.refresh();
          },
        });
      })
      .catch((error) => {
        Swal.fire({
          title: tMessages("updateError", { entity: "aplicación" }),
          text: (error as any)?.message || tMessages("unexpectedError"),
          icon: "error",
        });
      });
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
