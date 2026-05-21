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
import { getCompanyApplicationsAction } from "../actions/company-applications.action";

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

  // Mock data for companies - replace with actual API call
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [applications, setApplications] = useState<ApplicationOption[]>([]);

  // Estado optimizado con memoización
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

      const niveles = await getCompaniesServices();

      setCompanyData({
        data: niveles,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error cargando niveles educativos:", error);
      setCompanyData({
        data: [],
        loading: false,
        error: "No se pudieron cargar los niveles educativos",
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    cargarCompanys();

    return () => {
      isMounted = false;
    };
  }, []);

  // Memoizar opciones para evitar recálculos
  const opcionesNiveles = useMemo(() => {
    return companyData.data
      .map((nivel) => ({
        id: nivel.id_company.toString(),
        value: nivel.id_company.toString(),
        label: `${nivel.name} (${nivel.description})`,
        disabled: false,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)); // Ordenar alfabéticamente
  }, [companyData.data, initialValues?.id]);

  // Load companies and applications data
  useEffect(() => {
    // Mock companies data
    const mockCompanies = [
      { id: 1, name: "Empresa ABC", description: "Descripción de Empresa ABC" },
      { id: 2, name: "Empresa XYZ", description: "Descripción de Empresa XYZ" },
      { id: 3, name: "Empresa 123", description: "Descripción de Empresa 123" },
    ];
    setCompanies(mockCompanies);

    // Mock applications data
    const mockApplications = [
      {
        id: 1,
        name: "Sistema de Gestión",
        description: "Aplicación de gestión",
      },
      {
        id: 2,
        name: "Portal de Clientes",
        description: "Portal para clientes",
      },
      { id: 3, name: "Sistema de Ventas", description: "Aplicación de ventas" },
    ];
    setApplications(mockApplications);
  }, []);

  const companyOptions = companies.map((company) => ({
    value: company.id.toString(),
    label: company.name,
  }));

  const applicationOptions = applications.map((app) => ({
    value: app.id.toString(),
    label: app.name,
  }));

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
            data={companyOptions}
            placeholder='Seleccionar empresa...'
            error={errors.company_id?.message}
            className='w-full col-span-12 md:col-span-6'
            description='Empresa asignada'
          />

          <FormSelectField
            controller={{ control, name: "application_id" }}
            label={t("fields.application_id")}
            data={applicationOptions}
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
