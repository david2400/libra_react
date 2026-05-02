/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import { IFormAddProps, IFormProps, IFormUpdateProps } from "@repo/ui/form/models/form.interface";
import { FormProfile } from "../scenes/formProfile";
import { validationProfile } from "../schemas/profile.schema";
import { IProfileCreateRequest, IProfileUpdateRequest } from "../models/profile.interface";
import { profiles } from "@/server/domains/access-control/account";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const FormBase = ({ initialValues, onSubmit, validationSchema }: IFormProps<any>) => {
  return <FormProfile initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema} />;
};

export const RegisterProfile = ({}: IFormAddProps = {}) => {
  const router = useRouter();

  const defaultValues: IProfileCreateRequest = {
    userId: 0,
    first_name: "",
    last_name: "",
  };

  const handleSubmit: SubmitHandler<IProfileCreateRequest> = async (values) => {
    const result = await profiles.create_profile_action(values);
    
    if (result.success) {
      Swal.fire({
        title: "Perfil creado exitosamente",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => router.refresh(),
      });
    } else {
      Swal.fire({
        title: "Error!",
        text: result.error?.message || "Ocurrió un error inesperado",
        icon: "error",
      });
    }
  };

  return <FormBase initialValues={defaultValues} onSubmit={handleSubmit} validationSchema={validationProfile()} />;
};

export const UpdateProfile = ({ initialValues }: IFormUpdateProps<IProfileUpdateRequest>) => {
  const router = useRouter();

  const handleSubmit: SubmitHandler<IProfileUpdateRequest> = async (values) => {
    if (!values.id) return;
    
    const result = await profiles.update_profile_action(values.id, values);
    
    if (result.success) {
      Swal.fire({
        title: "Perfil actualizado exitosamente",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => router.refresh(),
      });
    } else {
      Swal.fire({
        title: "Error!",
        text: result.error?.message || "Ocurrió un error inesperado",
        icon: "error",
      });
    }
  };

  if (!initialValues) return null;

  return <FormBase initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationProfile()} />;
};
