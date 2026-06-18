/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import {
  IFormAddProps,
  IFormProps,
  IFormUpdateProps,
} from "@repo/ui/form/models";
import { FormMenu } from "../scenes/formMenu";
import { validationMenu } from "../schemas/menu.schema";
import {
  IMenuCreateRequest,
  IMenuUpdateRequest,
  IMenu,
} from "../models/menu.interface";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import {
  createMenuServerAction,
  updateMenuServerAction,
} from "@/app/[locale]/(protected)/navigation/menus/actions";

const FormBase = ({
  initialValues,
  onSubmit,
  validationSchema,
  availableMenus,
}: IFormProps<any> & { availableMenus?: IMenu[] }) => {
  return (
    <FormMenu
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      availableMenus={availableMenus}
    />
  );
};

interface IRegisterMenuProps extends IFormAddProps {
  availableMenus?: IMenu[];
}

export const RegisterMenu = ({ availableMenus }: IRegisterMenuProps = {}) => {
  const router = useRouter();
  const { useTranslations } = require("next-intl");
  const t = useTranslations("navigation.menus.messages");
  const tMessages = useTranslations("messages");

  const defaultValues: IMenuCreateRequest = {
    application_id: 0,
    name: "",
    description: "",
    path: "",
    order: 0,
    parent_menu_id: null,
    icon: "",
    visible: true,
  };

  const handleSubmit: SubmitHandler<IMenuCreateRequest> = async (values) => {
    try {
      const result = await createMenuServerAction(values);

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
      validationSchema={validationMenu()}
      availableMenus={availableMenus}
    />
  );
};

interface IUpdateMenuProps extends IFormUpdateProps<IMenuUpdateRequest> {
  availableMenus?: IMenu[];
}

export const UpdateMenu = ({
  initialValues,
  availableMenus,
}: IUpdateMenuProps) => {
  const router = useRouter();
  const { useTranslations } = require("next-intl");
  const t = useTranslations("navigation.menus.messages");
  const tMessages = useTranslations("messages");

  const handleSubmit: SubmitHandler<IMenuUpdateRequest> = async (values) => {
    if (!values.id_menu) return;

    try {
      const result = await updateMenuServerAction(values.id_menu, values);

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
      validationSchema={validationMenu()}
      availableMenus={availableMenus}
    />
  );
};
