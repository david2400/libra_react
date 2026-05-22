/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes";
import { FormSelectField } from "@repo/ui/form";
import { Buttons } from "@repo/ui/buttons";
import { IFormProps } from "@repo/ui/form/models";
import { useState, useEffect, useMemo } from "react";
import { ICompany } from "@/server/domains/access-control/account/companies";
import {
  getAllApplications,
  getAllCompanyAction,
} from "../actions/company-applications.action";
import { IApplication } from "@/server/domains/access-control/security/applications";

// Define types for mock data
interface CompanyOption {
  id: number;
  name: string;
  description: string;
}

interface ApplicationOption {
  id: number;
  name: string;
  description: string;
}

export const FormCompanyApplication = ({
  initialValues,
  validationSchema,
  onSubmit,
}: IFormProps<any>) => {
  const t = useTranslations("security.companyApplications");
  const tCommon = useTranslations("common");
  type CompanyApplicationInputs = z.infer<typeof validationSchema>;

  const [applicationsData, setApplications] = useState<{
    data: IApplication[];
    loading: boolean;
    error: string | null;
  }>({
    data: [],
    loading: false,
    error: null,
  });

  const [companyData, setCompanyData] = useState<{
    data: ICompany[];
    loading: boolean;
    error: string | null;
  }>({
    data: [],
    loading: false,
    error: null,
  });

  const cargarCompanys = async () => {
    try {
      setCompanyData((prev) => ({ ...prev, loading: true, error: null }));

      const companies = await getAllCompanyAction();

      setCompanyData({
        data: companies,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error cargando companies educativos:", error);
      setCompanyData({
        data: [],
        loading: false,
        error: "No se pudieron cargar los companies educativos",
      });
    }
  };

  // Memoizar opciones para evitar recálculos
  const opcionesCompany = useMemo(() => {
    return companyData.data
      .map((nivel) => ({
        id: nivel.id_company.toString(),
        value: nivel.id_company.toString(),
        label: `${nivel.name}`,
        disabled: false,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)); // Ordenar alfabéticamente
  }, [companyData.data, initialValues?.id]);

  const cargarApplications = async () => {
    try {
      setApplications((prev) => ({ ...prev, loading: true, error: null }));

      const applications = await getAllApplications();
      console.log("applications", applications);
      setApplications({
        data: applications,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error cargando applications educativos:", error);
      setApplications({
        data: [],
        loading: false,
        error: "No se pudieron cargar los applications educativos",
      });
    }
  };

  // Memoizar opciones para evitar recálculos
  const opcionesApplications = useMemo(() => {
    return applicationsData.data
      .map((nivel) => ({
        id: nivel.id_application.toString(),
        value: nivel.id_application.toString(),
        label: `${nivel.name}`,
        disabled: false,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)); // Ordenar alfabéticamente
  }, [applicationsData.data, initialValues?.id]);

  useEffect(() => {
    let isMounted = true;

    cargarCompanys();
    cargarApplications();

    return () => {
      isMounted = false;
    };
  }, []);

  const subscriptionTypeOptions = [
    { value: "basic", label: "Básico" },
    { value: "premium", label: "Premium" },
    { value: "enterprise", label: "Empresarial" },
    { value: "custom", label: "Personalizado" },
  ];

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyApplicationInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {/* Información Básica */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Información Básica
        </h3>
        <div className='grid grid-cols-12 gap-4'>
          <FormSelectField
            controller={{ control, name: "company_id" }}
            label={t("fields.company_id")}
            data={opcionesCompany}
            placeholder='Seleccionar empresa...'
            error={errors.company_id?.message}
            className='w-full col-span-12 md:col-span-6'
            description='Empresa asignada'
          />

          <FormSelectField
            controller={{ control, name: "application_id" }}
            label={t("fields.application_id")}
            data={opcionesApplications}
            placeholder='Seleccionar aplicación...'
            error={errors.application_id?.message}
            className='w-full col-span-12 md:col-span-6'
            description='Aplicación asignada'
          />
        </div>
      </div>

      {/* Configuración de Licencia */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Configuración de Licencia
        </h3>
        <div className='grid grid-cols-12 gap-4'>
          <FormField
            controller={{ control, name: "license_start_date" }}
            label={t("fields.license_start_date")}
            type='date'
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "license_end_date" }}
            label={t("fields.license_end_date")}
            type='date'
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "user_limit" }}
            label={t("fields.user_limit")}
            type='number'
            placeholder='Número de usuarios'
            className='col-span-12 md:col-span-4'
          />

          <FormSelectField
            controller={{ control, name: "subscription_type" }}
            label={t("fields.subscription_type")}
            data={subscriptionTypeOptions}
            placeholder='Seleccionar tipo...'
            error={errors.subscription_type?.message}
            className='w-full col-span-12 md:col-span-4'
            description='Tipo de suscripción'
          />

          <FormField
            controller={{ control, name: "is_active" }}
            label={t("fields.is_active")}
            type='checkbox'
            className='col-span-12 md:col-span-4'
          />
        </div>
      </div>

      {/* Configuración Adicional */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Configuración Adicional
        </h3>
        <div className='grid grid-cols-12 gap-4'>
          <FormField
            controller={{ control, name: "auto_renew" }}
            label={t("fields.auto_renew")}
            type='checkbox'
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "notes" }}
            label={t("fields.notes")}
            type='textarea'
            placeholder='Notas adicionales...'
            className='col-span-12 md:col-span-6'
          />
        </div>
      </div>

      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
