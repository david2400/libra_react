/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import { IFormAddProps, IFormProps, IFormUpdateProps } from "@repo/ui/form/models";
import { FormCompany } from "../scenes/formCompany";
import { validationCompany } from "../schemas/company.schema";
import { ICompanyCreateRequest, ICompanyUpdateRequest } from "../models/company.interface";
import Swal from "sweetalert2";
import { useRouter } from "@repo/ui/shared/i18n/routing";
import { createCompanyServerAction, updateCompanyServerAction } from "@/app/[locale]/(protected)/account/companies/actions";

const FormBase = ({ initialValues, onSubmit, validationSchema }: IFormProps<any>) => {
  return <FormCompany initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema} />;
};

export const RegisterCompany = ({ }: IFormAddProps = {}) => {
  const router = useRouter();
  const { useTranslations } = require('next-intl');
  const t = useTranslations('account.companies.messages');
  const tMessages = useTranslations('messages');

  const defaultValues: ICompanyCreateRequest = {
    name: "",
    nit: "",
    active_date: "",
    status: "",
    email: "",
    phone: "",
    website: "",
    contact_person: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    legal_representative: "",
    tax_regime: "",
    economic_activity: "",
    employee_count: 0,
    timezone: "",
    currency: "",
    language: "",
    is_active: true,
    is_verified: false,
    verification_date: "",
    max_users: 0,
    max_applications: 0,
    subscription_type: "",
    subscription_start_date: "",
    subscription_end_date: "",
  };

  const handleSubmit: SubmitHandler<ICompanyCreateRequest> = async (values) => {
    try {
      const result = await createCompanyServerAction(values);

      await Swal.fire({
        title: t('createSuccess'),
        icon: "success",
        timer: 3000,
        showConfirmButton: true,
      });
      router.refresh();
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

export const UpdateCompany = ({ initialValues }: IFormUpdateProps<any>) => {
  const router = useRouter();
  const { useTranslations } = require('next-intl');
  const t = useTranslations('account.companies.messages');
  const tMessages = useTranslations('messages');


  const handleSubmit: SubmitHandler<ICompanyUpdateRequest> = async (values) => {

    try {
      const id = initialValues?.id_company
      if (!id) return;
      console.log('id', id);
      const result = await updateCompanyServerAction(id, values);

      await Swal.fire({
        title: t('updateSuccess'),
        icon: "success",
        timer: 3000,
        showConfirmButton: true,
      });
      router.refresh();
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
