/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import {
  IFormAddProps,
  IFormProps,
  IFormUpdateProps,
} from "@repo/ui/form/models";
import { FormUser } from "../scenes/formUser";
import { validationUser, validationUpdateUser } from "../schemas/user.schema";
import {
  IUserCreateRequest,
  IUserUpdateRequest,
} from "../models/user.interface";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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

export const RegisterUser = ({ }: IFormAddProps = {}) => {
  const router = useRouter();
  const { useTranslations } = require("next-intl");
  const t = useTranslations("account.users.messages");
  const tMessages = useTranslations("messages");

  const defaultValues: IUserCreateRequest = {
    username: "",
    password: "",
    status: "active",
  };

  const handleSubmit: SubmitHandler<IUserCreateRequest> = async (
    values,
  ) => {
    try {
      const result = await createUserServerAction(values);

      await Swal.fire({
        title: t("createSuccess"),
        icon: "success",
        timer: 3000,
        showConfirmButton: true,
      });

      router.refresh();
    } catch (error) {
      Swal.fire({
        title: tMessages("createError", { entity: "usuario" }),
        text: (error as any)?.message || tMessages("unexpectedError"),
        icon: "error",
      });
    }
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
  handleClose,
}: IFormUpdateProps<IUserUpdateRequest>) => {
  const router = useRouter();
  const t = useTranslations("account.users.messages");
  const tMessages = useTranslations("messages");

  const handleSubmit: SubmitHandler<IUserUpdateRequest> = async (
    values,
  ) => {
    try {
      const id = initialValues?.id_user;
      if (!id) return;

      const result = await updateUserServerAction(
        id,
        values,
      )
      await Swal.fire({
        title: t("updateSuccess"),
        icon: "success",
        timer: 3000,
        showConfirmButton: true,
      });

      router.refresh();
    } catch (error) {
      Swal.fire({
        title: tMessages("updateError", { entity: "usuario" }),
        text: (error as any)?.message || tMessages("unexpectedError"),
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
      validationSchema={validationUpdateUser()}
    />
  );
};
