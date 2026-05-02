/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import {
  IFormAddProps,
  IFormProps,
  IFormUpdateProps,
} from "@repo/ui/form/models/form.interface";
import { FormMenu } from "../scenes/formMenu";
import { validationMenu } from "../schemas/menu.schema";
import {
  IMenuCreateRequest,
  IMenuUpdateRequest,
  IMenu,
} from "../models/menu.interface";
import { menus } from "@/server/domains/access-control/navigation";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

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

export const RegisterMenu = ({ availableMenus }: RegisterMenuProps = {}) => {
  const router = useRouter();

  const defaultValues: IMenuCreateRequest = {
    name: "",
    label: "",
    icon: "",
    path: "",
    parentId: undefined,
    order: 0,
  };

  const handleSubmit: SubmitHandler<IMenuCreateRequest> = async (values) => {
    const result = await menus.create_menu_action(values);
    
    if (result.success) {
      Swal.fire({
        title: "Menú creado exitosamente",
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
}: UpdateMenuProps) => {
  const router = useRouter();

  const handleSubmit: SubmitHandler<IMenuUpdateRequest> = async (values) => {
    if (!values.id) return;
    
    const result = await menus.update_menu_action(values.id, values);
    
    if (result.success) {
      Swal.fire({
        title: "Menú actualizado exitosamente",
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
      validationSchema={validationMenu()}
      availableMenus={availableMenus}
    />
  );
};
