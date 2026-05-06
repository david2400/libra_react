/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import { IFormAddProps, IFormProps, IFormUpdateProps } from "@repo/ui/form/models/form.interface";
import { FormProfile } from "../scenes/formProfile";
import { validationProfile } from "../schemas/profile.schema";
import { IProfileCreateRequest, IProfileUpdateRequest } from "../models/profile.interface";
import { profilesApi } from "@/lib/api";
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
    try {
      const result = await profilesApi.create(values);
      
      Swal.fire({
        title: "Perfil creado exitosamente",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => router.refresh(),
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: (error as any)?.message || "Ocurrió un error inesperado",
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
    
    try {
      const result = await profilesApi.update(values.id, values);
      
      Swal.fire({
        title: "Perfil actualizado exitosamente",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => router.refresh(),
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: (error as any)?.message || "Ocurrió un error inesperado",
        icon: "error",
      });
    }
  };

  if (!initialValues) return null;

  return <FormBase initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationProfile()} />;
};
