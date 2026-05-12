/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import { IFormAddProps, IFormProps, IFormUpdateProps } from "@repo/ui/form/models/form.interface";
import { FormCompany } from "../scenes/formCompany";
import { validationCompany } from "../schemas/company.schema";
import { ICompanyCreateRequest, ICompanyUpdateRequest } from "../models/company.interface";
import { companiesApi } from "@/lib/api";
import Swal from "sweetalert2";
import { useRouter } from "@repo/ui/shared/i18n/routing";

const FormBase = ({ initialValues, onSubmit, validationSchema }: IFormProps<any>) => {
  return <FormCompany initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema} />;
};

export const RegisterCompany = ({}: IFormAddProps = {}) => {
  const router = useRouter();
  const { useTranslations } = require('next-intl');
  const t = useTranslations('account.companies.messages');
  const tMessages = useTranslations('messages');

  const defaultValues: ICompanyCreateRequest = {
    name: "",
    description: "",
    industry: "",
  };

  const handleSubmit: SubmitHandler<ICompanyCreateRequest> = async (values) => {
    try {
      const result = await companiesApi.create(values);
      
      Swal.fire({
        title: t('createSuccess'),
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => router.refresh(),
      });
    } catch (error) {
      Swal.fire({
        title: tMessages('createError', { entity: 'empresa' }),
        text: (error as any)?.message || tMessages('unexpectedError'),
        icon: "error",
      });
    }
  };

  return <FormBase initialValues={defaultValues} onSubmit={handleSubmit} validationSchema={validationCompany()} />;
};

export const UpdateCompany = ({ initialValues }: IFormUpdateProps<ICompanyUpdateRequest>) => {
  const router = useRouter();
  const { useTranslations } = require('next-intl');
  const t = useTranslations('account.companies.messages');
  const tMessages = useTranslations('messages');

  const handleSubmit: SubmitHandler<ICompanyUpdateRequest> = async (values) => {
    if (!values.id) return;
    
    try {
      const result = await companiesApi.update(values.id, values);
      
      Swal.fire({
        title: t('updateSuccess'),
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
        willClose: () => router.refresh(),
      });
    } catch (error) {
      Swal.fire({
        title: tMessages('updateError', { entity: 'empresa' }),
        text: (error as any)?.message || tMessages('unexpectedError'),
        icon: "error",
      });
    }
  };

  if (!initialValues) return null;

  return <FormBase initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationCompany()} />;
};
