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

export const RegisterCompany = ({}: IFormAddProps = {}) => {
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

export const UpdateCompany = ({ initialValues }: IFormUpdateProps<any>) => {
  const router = useRouter();
  const { useTranslations } = require('next-intl');
  const t = useTranslations('account.companies.messages');
  const tMessages = useTranslations('messages');

  // Transform ICompany to IUpdateCompany format
  const transformCompanyToUpdateRequest = (company: any): ICompanyUpdateRequest => {
    return {
      id: company.id_company, // Add the required id field
      id_company: company.id_company,
      name: company.name,
      nit: company.nit,
      active_date: company.active_date,
      status: company.status,
      email: company.email || "",
      phone: company.phone || "",
      website: company.website || "",
      contact_person: company.contact_person || "",
      address: company.address || "",
      city: company.city || "",
      country: company.country || "",
      postal_code: company.postal_code || "",
      legal_representative: company.legal_representative || "",
      tax_regime: company.tax_regime || "",
      economic_activity: company.economic_activity || "",
      employee_count: company.employee_count || 0,
      timezone: company.timezone || "",
      currency: company.currency || "",
      language: company.language || "",
      is_active: company.is_active,
      is_verified: company.is_verified,
      verification_date: company.verification_date || "",
      max_users: company.max_users || 0,
      max_applications: company.max_applications || 0,
      subscription_type: company.subscription_type || "",
      subscription_start_date: company.subscription_start_date || "",
      subscription_end_date: company.subscription_end_date || "",
    };
  };

  const handleSubmit: SubmitHandler<ICompanyUpdateRequest> = async (values) => {
    if (!values.id_company) return;
    
    try {
      const result = await updateCompanyServerAction(values.id_company, values);
      
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

  const transformedValues = transformCompanyToUpdateRequest(initialValues);

  return <FormBase initialValues={transformedValues} onSubmit={handleSubmit} validationSchema={validationCompany()} />;
};
