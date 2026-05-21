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
  createUserServerAction,
  updateUserServerAction,
} from "@/app/[locale]/(protected)/account/users/actions";

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
    const result = await createUserServerAction(values)
      .then((result) => {
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

    const result = await updateUserServerAction(values.id_user, values)
      .then((result) => {
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

  if (!initialValues) return null;

  return (
    <FormBase
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationUser()}
    />
  );
};
