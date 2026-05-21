/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import {
  IFormAddProps,
  IFormProps,
  IFormUpdateProps,
} from "@repo/ui/form/models";
import { FormPermission } from "../scenes/formPermission";
import { validationPermission } from "../schemas/permission.schema";
import {
  IPermissionCreateRequest,
  IPermissionUpdateRequest,
  IPermission,
} from "../models/permission.interface";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import {
  createPermissionServerAction,
  updatePermissionServerAction,
} from "@/app/[locale]/(protected)/security/permissions/actions";

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
  const { useTranslations } = require("next-intl");
  const t = useTranslations("security.permissions.messages");
  const tMessages = useTranslations("messages");

  const defaultValues: IPermissionCreateRequest = {
    name: "",
    description: "",
    permission_type: "APPLICATION",
    resource: "",
    action: "READ",
    application_id: undefined,
    module_id: undefined,
    http_method: "",
    endpoint_path: "",
    ui_component: "",
    feature_flag: "",
    priority: 0,
    cache_ttl: 3600,
    is_sensitive: false,
    metadata: "",
  };

  const handleSubmit: SubmitHandler<IPermissionCreateRequest> = async (
    values,
  ) => {
    const result = await createPermissionServerAction(values)
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
          title: tMessages("createError", { entity: "permiso" }),
          text: error?.message || tMessages("unexpectedError"),
          icon: "error",
        });
      });
  };

  return (
    <FormBase
      initialValues={defaultValues}
      onSubmit={handleSubmit}
      validationSchema={validationPermission()}
    />
  );
};

export const UpdatePermission = ({ initialValues }: IFormUpdateProps<any>) => {
  const router = useRouter();
  const { useTranslations } = require("next-intl");
  const t = useTranslations("security.permissions.messages");
  const tMessages = useTranslations("messages");

  const handleSubmit: SubmitHandler<IPermissionUpdateRequest> = async (
    values,
  ) => {
    if (!values.id_permission) return;

    const result = await updatePermissionServerAction(
      values.id_permission,
      values,
    )
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
          title: tMessages("updateError", { entity: "permiso" }),
          text: (error as any)?.message || tMessages("unexpectedError"),
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
      validationSchema={validationPermission()}
    />
  );
};
