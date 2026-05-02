/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import {
  IFormAddProps,
  IFormProps,
  IFormUpdateProps,
} from "@repo/ui/form/models/form.interface";
import { FormPermission } from "../scenes/formPermission";
import { validationPermission } from "../schemas/permission.schema";
import {
  IPermissionCreateRequest,
  IPermissionUpdateRequest,
  IPermission,
} from "../models/permission.interface";
import { permissions } from "@/server/domains/access-control/security";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const FormBase = ({
  initialValues,
  onSubmit,
  validationSchema,
}: IFormProps<any>) => {
  return (
    <FormPermission
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    />
  );
};

export const RegisterPermission = ({}: IFormAddProps = {}) => {
  const router = useRouter();

  const defaultValues: IPermissionCreateRequest = {
    name: "",
    description: "",
    resource: "",
    action: "",
  };

  const handleSubmit: SubmitHandler<IPermissionCreateRequest> = async (values) => {
    const result = await permissions.create_permission_action(values);
    
    if (result.success) {
      Swal.fire({
        title: "Permiso creado exitosamente",
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
      validationSchema={validationPermission()}
    />
  );
};

export const UpdatePermission = ({
  initialValues,
}: IFormUpdateProps<IPermissionUpdateRequest>) => {
  const router = useRouter();

  const handleSubmit: SubmitHandler<IPermissionUpdateRequest> = async (values) => {
    if (!values.id) return;
    
    const result = await permissions.update_permission_action(values.id, values);
    
    if (result.success) {
      Swal.fire({
        title: "Permiso actualizado exitosamente",
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
      validationSchema={validationPermission()}
    />
  );
};
