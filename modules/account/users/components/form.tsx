/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import {
  IFormAddProps,
  IFormProps,
  IFormUpdateProps,
} from "@repo/ui/form/models";
import { FormUser } from "../scenes/formUser";
import { validationUser } from "../schemas/user.schema";
import {
  IUserCreateRequest,
  IUserUpdateRequest,
} from "../models/user.interface";
import Swal from "sweetalert2";

import { useRouter } from "next/navigation";
import {
  createUserAction,
  updateUserAction,
} from "@/server/domains/access-control/account/users/actions";

const FormBase = ({
  initialValues,
  onSubmit,
  validationSchema,
}: IFormProps<any>) => {
  return (
    <FormUser
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    />
  );
};

export const RegisterUser = ({}: IFormAddProps = {}) => {
  const router = useRouter();

  const defaultValues: IUserCreateRequest = {
    username: "",
    password: "",
    status: "active",
  };

  const handleSubmit: SubmitHandler<IUserCreateRequest> = async (values) => {
    const result = await createUserAction(values)
      .then((result) => {
        if (!result.success) {
          throw new Error(result.error?.message || "Ocurrió un error inesperado");
        }
        Swal.fire({
          title: "Usuario creado exitosamente",
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
          willClose: () => router.refresh(),
        });
      })
      .catch((error) => {
        Swal.fire({
          title: "Error!",
          text: (error as any)?.message || "Ocurrió un error inesperado",
          icon: "error",
        });
      });
  };

  return (
    <FormBase
      initialValues={defaultValues}
      onSubmit={handleSubmit}
      validationSchema={validationUser()}
    />
  );
};

export const UpdateUser = ({
  initialValues,
}: IFormUpdateProps<IUserUpdateRequest>) => {
  const router = useRouter();

  const handleSubmit: SubmitHandler<IUserUpdateRequest> = async (values) => {
    if (!values.id_user) return;

    const result = await updateUserAction(values.id_user, values)
      .then((result) => {
        if (!result.success) {
          throw new Error(result.error?.message || "Ocurrió un error inesperado");
        }
        Swal.fire({
          title: "Usuario actualizado exitosamente",
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
          willClose: () => router.refresh(),
        });
      })
      .catch((error) => {
        Swal.fire({
          title: "Error!",
          text: (error as any)?.message || "Ocurrió un error inesperado",
          icon: "error",
        });
      });
  };

  if (!initialValues) return null;

  return (
    <FormBase
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationUser()}
    />
  );
};
