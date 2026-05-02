/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import {
  IFormAddProps,
  IFormProps,
  IFormUpdateProps,
} from "@repo/ui/form/models/form.interface";
import { FormApplication } from "../scenes/formApplication";
import { validationApplication } from "../schemas/application.schema";
import {
  IApplicationCreateRequest,
  IApplicationUpdateRequest,
} from "../models/application.interface";
import { applications } from "@/server/domains/access-control/security";
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

  const defaultValues: IApplicationCreateRequest = {
    name: "",
    description: "",
    version: "",
    status: "active",
    baseUrl: "",
  };

  const handleSubmit: SubmitHandler<IApplicationCreateRequest> = async (values) => {
    const result = await applications.create_application_action(values);
    
    if (result.success) {
      Swal.fire({
        title: "Aplicación creada exitosamente",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => {
          router.refresh();
        },
      });
    } else {
      Swal.fire({
        title: "Error!",
        text: result.error?.message || "Ocurrió un error inesperado",
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

  const handleSubmit: SubmitHandler<IApplicationUpdateRequest> = async (values) => {
    if (!values.id) return;
    
    const result = await applications.update_application_action(values.id, values);
    
    if (result.success) {
      Swal.fire({
        title: "Aplicación actualizada exitosamente",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => {
          router.refresh();
        },
      });
    } else {
      Swal.fire({
        title: "Error!",
        text: result.error?.message || "Ocurrió un error inesperado",
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
