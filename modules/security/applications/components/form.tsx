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
        title: "Aplicación creada exitosamente",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => {
          router.refresh();
        },
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: (error as any)?.message || "Ocurrió un error inesperado",
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
    
    try {
      const result = await applicationsApi.update(values.id, values);
      
      Swal.fire({
        title: "Aplicación actualizada exitosamente",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => {
          router.refresh();
        },
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: (error as any)?.message || "Ocurrió un error inesperado",
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
