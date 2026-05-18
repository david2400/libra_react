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
import { createRoleAction } from "../api/actions";
import { updateApplicationAction } from "../../applications/api/actions";

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
  const { useTranslations } = require("next-intl");
  const t = useTranslations("security.roles.messages");
  const tMessages = useTranslations("messages");

  const defaultValues: IRoleCreateRequest = {
    name: "",
    description: "",
    manage_users: false,
    requires_approval: false,
    // approval_workflow: {},
  };

  const handleSubmit: SubmitHandler<IRoleCreateRequest> = async (values) => {
    const result = await createRoleAction(values)
      .then(() => {
        Swal.fire({
          title: t("createSuccess"),
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
          willClose: () => {
            router.refresh();
          },
        });
      })
      .catch((error) => {
        Swal.fire({
          title: tMessages("createError", { entity: "rol" }),
          text: error?.message || tMessages("unexpectedError"),
          icon: "error",
        });
      });
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
    if (!values.id_role) return;

    const result = await updateApplicationAction(values.id_role, values)
      .then(() => {
        Swal.fire({
          title: t("updateSuccess"),
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
          willClose: () => {
            router.refresh();
          },
        });
      })
      .catch((error) => {
        Swal.fire({
          title: tMessages("updateError", { entity: "rol" }),
          text: error?.message || tMessages("unexpectedError"),
          icon: "error",
        });
      });
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
