/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import {
  IFormAddProps,
  IFormProps,
  IFormUpdateProps,
} from "@repo/ui/form/models";
import { FormPolicy } from "../scenes/formPolicy";
import { validationPolicy } from "../schemas/policy.schema";
import {
  IPolicyCreateRequest,
  IPolicyUpdateRequest,
} from "../models/policy.interface";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import {
  createPolicyServerAction,
  updatePolicyServerAction,
} from "@/app/[locale]/(protected)/security/policies/actions";
import { PolicyEffect } from "@/server/domains/access-control/security/policies/types";

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
    application_id: 1,
    version: "",
    default_effect: PolicyEffect.ALLOW,
    is_active: true,
    priority: 1,
  };

  const handleSubmit: SubmitHandler<IPolicyCreateRequest> = async (values) => {
    try {
      await createPolicyServerAction(values);
      await Swal.fire({
        title: "Política creada exitosamente",
        icon: "success",
        timer: 3000,
        showConfirmButton: true,
      });
      router.refresh();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error?.message || "Ocurrió un error inesperado",
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
    if (!values.id_policy) return;

    try {
      await updatePolicyServerAction(values.id_policy, values);
      await Swal.fire({
        title: "Política actualizada exitosamente",
        icon: "success",
        timer: 3000,
        showConfirmButton: true,
      });
      router.refresh();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error?.message || "Ocurrió un error inesperado",
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
