/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import { IFormAddProps, IFormProps, IFormUpdateProps } from "@repo/ui/form/models/form.interface";
import { FormModuleApplication } from "../scenes/formModuleApplication";
import { validationModuleApplication } from "../schemas/module-application.schema";
import { IModuleApplicationCreateRequest, IModuleApplicationUpdateRequest } from "../models/module-application.interface";
import { modulesApplicationsApi } from "@/lib/api";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const FormBase = ({ initialValues, onSubmit, validationSchema }: IFormProps<any>) => {
  return <FormModuleApplication initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema} />;
};

export const RegisterModuleApplication = ({}: IFormAddProps = {}) => {
  const router = useRouter();

  const defaultValues: IModuleApplicationCreateRequest = {
    moduleId: 0,
    applicationId: 0,
    isActive: true,
  };

  const handleSubmit: SubmitHandler<IModuleApplicationCreateRequest> = async (values) => {
    try {
      const result = await modulesApplicationsApi.create(values.moduleId, values.applicationId, values);
      
      Swal.fire({
        title: "Módulo asignado exitosamente",
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

  return <FormBase initialValues={defaultValues} onSubmit={handleSubmit} validationSchema={validationModuleApplication()} />;
};

export const UpdateModuleApplication = ({ initialValues }: IFormUpdateProps<IModuleApplicationUpdateRequest>) => {
  const router = useRouter();

  const handleSubmit: SubmitHandler<IModuleApplicationUpdateRequest> = async (values) => {
    if (!values.moduleId || !values.applicationId) return;
    
    try {
      const result = await modulesApplicationsApi.update(values.moduleId, values.applicationId, values);
      
      Swal.fire({
        title: "Asignación actualizada exitosamente",
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

  return <FormBase initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationModuleApplication()} />;
};
