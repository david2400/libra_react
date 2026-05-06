/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import {
  IFormAddProps,
  IFormProps,
  IFormUpdateProps,
} from "@repo/ui/form/models/form.interface";
import { FormPolicy } from "../scenes/formPolicy";
import { validationPolicy } from "../schemas/policy.schema";
import {
  IPolicyCreateRequest,
  IPolicyUpdateRequest,
} from "../models/policy.interface";
import { policiesApi } from "@/lib/api";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const FormBase = ({
  initialValues,
  onSubmit,
  validationSchema,
}: IFormProps<any>) => {
  return (
    <FormPolicy
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    />
  );
};

export const RegisterPolicy = ({}: IFormAddProps = {}) => {
  const router = useRouter();

  const defaultValues: IPolicyCreateRequest = {
    name: "",
    description: "",
    rules: [],
  };

  const handleSubmit: SubmitHandler<IPolicyCreateRequest> = async (values) => {
    try {
      const result = await policiesApi.create(values);
      
      Swal.fire({
        title: "Política creada exitosamente",
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
      validationSchema={validationPolicy()}
    />
  );
};

export const UpdatePolicy = ({
  initialValues,
}: IFormUpdateProps<IPolicyUpdateRequest>) => {
  const router = useRouter();

  const handleSubmit: SubmitHandler<IPolicyUpdateRequest> = async (values) => {
    if (!values.id) return;
    
    try {
      const result = await policiesApi.update(values.id, values);
      
      Swal.fire({
        title: "Política actualizada exitosamente",
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
      validationSchema={validationPolicy()}
    />
  );
};
