/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import {
  IFormAddProps,
  IFormProps,
  IFormUpdateProps,
} from "@repo/ui/form/models/form.interface";
import { FormRole } from "../scenes/formRole";
import { validationRole } from "../schemas/role.schema";
import {
  IRoleCreateRequest,
  IRoleUpdateRequest,
  IRole,
} from "../models/role.interface";
import { roles } from "@/server/domains/access-control/security";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const FormBase = ({
  initialValues,
  onSubmit,
  validationSchema,
}: IFormProps<any>) => {
  return (
    <FormRole
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    />
  );
};

export const RegisterRole = ({}: IFormAddProps = {}) => {
  const router = useRouter();

  const defaultValues: IRoleCreateRequest = {
    name: "",
    description: "",
    permission_ids: [],
    menu_ids: [],
  };

  const handleSubmit: SubmitHandler<IRoleCreateRequest> = async (values) => {
    const result = await roles.create_role_action(values);
    
    if (result.success) {
      Swal.fire({
        title: "Rol creado exitosamente",
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
      validationSchema={validationRole()}
    />
  );
};

export const UpdateRole = ({
  initialValues,
}: IFormUpdateProps<IRoleUpdateRequest>) => {
  const router = useRouter();

  const handleSubmit: SubmitHandler<IRoleUpdateRequest> = async (values) => {
    if (!values.id) return;
    
    const result = await roles.update_role_action(values.id, values);
    
    if (result.success) {
      Swal.fire({
        title: "Rol actualizado exitosamente",
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
      validationSchema={validationRole()}
    />
  );
};
