/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import {
  IFormAddProps,
  IFormProps,
  IFormUpdateProps,
} from "@repo/ui/form/models";
import { FormRole } from "../scenes/formRole";
import { validationRole } from "../schemas/role.schema";
import {
  IRoleCreateRequest,
  IRoleUpdateRequest,
  IRole,
} from "../models/role.interface";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
// TODO: Fix application action import
// import { updateApplicationAction } from "../../applications/api/actions";
import { createRoleServerAction, updateRoleServerAction } from "@/app/[locale]/(protected)/security/roles/actions";

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

export const RegisterRole = ({ }: IFormAddProps = {}) => {
  const router = useRouter();
  const { useTranslations } = require("next-intl");
  const t = useTranslations("security.roles.messages");
  const tMessages = useTranslations("messages");

  const defaultValues: IRoleCreateRequest = {
    name: "",
    description: "",
    manage_users: false,
    requires_approval: false,
    application_id: 0, // Temporary value, will be updated when user selects an application
    // approval_workflow: {},
  };

  const handleSubmit: SubmitHandler<IRoleCreateRequest> = async (values) => {
    try {
      await createRoleServerAction(values);
      await Swal.fire({
        title: t("createSuccess"),
        icon: "success",
        timer: 3000,
        showConfirmButton: true,
      });
      router.refresh();
    } catch (error: any) {
      Swal.fire({
        title: tMessages("createError", { entity: "rol" }),
        text: error?.message || tMessages("unexpectedError"),
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
  const { useTranslations } = require("next-intl");
  const t = useTranslations("security.roles.messages");
  const tMessages = useTranslations("messages");

  const handleSubmit: SubmitHandler<IRoleUpdateRequest> = async (values) => {
    try {
      const id = initialValues?.id_role
      if (!id) return;
      
      await updateRoleServerAction(id, values);
      await Swal.fire({
        title: t("updateSuccess"),
        icon: "success",
        timer: 3000,
        showConfirmButton: true,
      });
      router.refresh();
    } catch (error: any) {
      Swal.fire({
        title: tMessages("updateError", { entity: "rol" }),
        text: error?.message || tMessages("unexpectedError"),
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
