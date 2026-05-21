/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import {
  IFormAddProps,
  IFormProps,
  IFormUpdateProps,
} from "@repo/ui/form/models";
import { FormProfile } from "../scenes/formProfile";
import { validationProfile } from "../schemas/profile.schema";
import {
  IProfileCreateRequest,
  IProfileUpdateRequest,
} from "../models/profile.interface";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import {
  createProfileServerAction,
  updateProfileServerAction,
} from "@/app/[locale]/(protected)/account/profiles/actions";
import { updateUserServerAction } from "@/app/[locale]/(protected)/account/users/actions";

const FormBase = ({
  initialValues,
  onSubmit,
  validationSchema,
}: IFormProps<any>) => {
  return (
    <FormProfile
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    />
  );
};

export const RegisterProfile = ({}: IFormAddProps = {}) => {
  const router = useRouter();
  const { useTranslations } = require("next-intl");
  const t = useTranslations("account.profiles.messages");
  const tMessages = useTranslations("messages");

  const defaultValues: IProfileCreateRequest = {
    user_id: 0,
    first_name: "",
    last_name: "",
    display_name: "",
    avatar_url: "",
    bio: "",
    phone: "",
    timezone: "",
    language: "",
    date_format: "",
    time_format: "12h",
    theme: "light",
  };

  const handleSubmit: SubmitHandler<IProfileCreateRequest> = async (values) => {
    const result = await createProfileServerAction(values)
      .then(() => {
        Swal.fire({
          title: t("createSuccess"),
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
          willClose: () => router.refresh(),
        });
      })
      .catch((error) => {
        Swal.fire({
          title: tMessages("createError", { entity: "perfil" }),
          text: (error as any)?.message || tMessages("unexpectedError"),
          icon: "error",
        });
      });
  };

  return (
    <FormBase
      initialValues={defaultValues}
      onSubmit={handleSubmit}
      validationSchema={validationProfile()}
    />
  );
};

export const UpdateProfile = ({
  initialValues,
}: IFormUpdateProps<IProfileUpdateRequest>) => {
  const router = useRouter();
  const { useTranslations } = require("next-intl");
  const t = useTranslations("account.profiles.messages");
  const tMessages = useTranslations("messages");

  const handleSubmit: SubmitHandler<IProfileUpdateRequest> = async (values) => {
    if (!values.id_profile) return;

    const result = await updateProfileServerAction(values.id_profile, values)
      .then(() => {
        Swal.fire({
          title: t("updateSuccess"),
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
          willClose: () => router.refresh(),
        });
      })
      .catch((error) => {
        Swal.fire({
          title: tMessages("updateError", { entity: "perfil" }),
          text: (error as any)?.message || tMessages("unexpectedError"),
          icon: "error",
        });
      });
  };

  if (!initialValues) return null;

  return (
    <FormBase
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationProfile()}
    />
  );
};
