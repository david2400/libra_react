/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import {
  IFormAddProps,
  IFormProps,
  IFormUpdateProps,
} from "@repo/ui/form/models";
import { FormApplicationCategory } from "../scenes/formApplicationCategory";
import { validationApplicationCategory } from "../schemas/applicationCategory.schema";
import {
  IApplicationCategoryCreateRequest,
  IApplicationCategoryUpdateRequest,
  IApplicationCategory,
} from "../models/applicationCategory.interface";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { createApplicationCategoryAction, updateApplicationCategoryAction } from "@/server/domains/access-control/security/application_categories";

const FormBase = ({
  initialValues,
  onSubmit,
  validationSchema,
  availableMenus,
}: IFormProps<any> & { availableMenus?: IApplicationCategory[] }) => {
  return (
    <FormApplicationCategory
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      availableApplicationCategory={availableMenus}
    />
  );
};

interface IRegisterMenuProps extends IFormAddProps {
  availableMenus?: IApplicationCategory[];
}

export const RegisterApplicationCategory = ({ availableMenus }: IRegisterMenuProps = {}) => {
  const router = useRouter();
  const { useTranslations } = require("next-intl");
  const t = useTranslations("navigation.menus.messages");
  const tMessages = useTranslations("messages");

  const defaultValues: IApplicationCategoryCreateRequest = {
    name: "",
    description: "",
    application_category_id: null,
  };

  const handleSubmit: SubmitHandler<IApplicationCategoryCreateRequest> = async (values) => {
    try {
      const result = await createApplicationCategoryAction(values);

      Swal.fire({
        title: t("createSuccess"),
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => {
          router.refresh();
        },
      });
    } catch (error) {
      Swal.fire({
        title: tMessages("createError", { entity: "menú" }),
        text: (error as any)?.message || tMessages("unexpectedError"),
        icon: "error",
      });
    }
  };

  return (
    <FormBase
      initialValues={defaultValues}
      onSubmit={handleSubmit}
      validationSchema={validationApplicationCategory()}
      availableMenus={availableMenus}
    />
  );
};

interface IUpdateMenuProps extends IFormUpdateProps<IApplicationCategoryUpdateRequest> {
  availableMenus?: IApplicationCategory[];
}

export const UpdateApplicationCategory = ({
  initialValues,
  availableMenus,
}: IUpdateMenuProps) => {
  const router = useRouter();
  const { useTranslations } = require("next-intl");
  const t = useTranslations("navigation.menus.messages");
  const tMessages = useTranslations("messages");

  const handleSubmit: SubmitHandler<IApplicationCategoryUpdateRequest> = async (values) => {
    if (!values.id_application_category) return;

    try {
      const result = await updateApplicationCategoryAction(values.id_application_category, values);

      Swal.fire({
        title: t("updateSuccess"),
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => {
          router.refresh();
        },
      });
    } catch (error) {
      Swal.fire({
        title: tMessages("updateError", { entity: "menú" }),
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
      validationSchema={validationApplicationCategory()}
      availableMenus={availableMenus}
    />
  );
};
