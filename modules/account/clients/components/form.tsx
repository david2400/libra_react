/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import { IFormAddProps, IFormProps, IFormUpdateProps } from "@repo/ui/form/models/form.interface";
import { FormClient } from "../scenes/formClient";
import { validationClient } from "../schemas/client.schema";
import { IClientCreateRequest, IClientUpdateRequest } from "../models/client.interface";
import { clientsApi } from "@/lib/api";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const FormBase = ({ initialValues, onSubmit, validationSchema }: IFormProps<any>) => {
  return <FormClient initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema} />;
};

export const RegisterClient = ({}: IFormAddProps = {}) => {
  const router = useRouter();

  const defaultValues: IClientCreateRequest = {
    name: "",
    email: "",
    phone: "",
  };

  const handleSubmit: SubmitHandler<IClientCreateRequest> = async (values) => {
    try {
      const result = await clientsApi.create(values);
      
      Swal.fire({
        title: "Cliente creado exitosamente",
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

  return <FormBase initialValues={defaultValues} onSubmit={handleSubmit} validationSchema={validationClient()} />;
};

export const UpdateClient = ({ initialValues }: IFormUpdateProps<IClientUpdateRequest>) => {
  const router = useRouter();

  const handleSubmit: SubmitHandler<IClientUpdateRequest> = async (values) => {
    if (!values.id) return;
    
    try {
      const result = await clientsApi.update(values.id, values);
      
      Swal.fire({
        title: "Cliente actualizado exitosamente",
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

  return <FormBase initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationClient()} />;
};
