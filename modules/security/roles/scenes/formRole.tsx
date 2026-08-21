/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React, { useState, useEffect } from "react";
import { FormField } from "@repo/ui/form/scenes";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { Buttons } from "@repo/ui/buttons";
import { IFormProps } from "@repo/ui/form/models";

export const FormRole = ({
  initialValues,
  validationSchema,
  onSubmit,
}: IFormProps<any>) => {
  const t = useTranslations("security.roles");
  const tCommon = useTranslations("common");
  type RoleInputs = z.infer<typeof validationSchema>;

  const [companies, setCompanies] = useState<any[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [companyApplications, setCompanyApplications] = useState<any[]>([]);
  const [companyApplicationsLoading, setCompanyApplicationsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RoleInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const companyId = watch('company_id');

  // Load companies and applications once
  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCompaniesLoading(true);
        const [{ getAllCompaniesServerAction }, { listApplicationsAction }] = await Promise.all([
          import('@/app/[locale]/(protected)/account/companies/actions'),
          import('../../role-permissions/actions/role.actions'),
        ]);

        const [companiesResult, applicationsResult] = await Promise.allSettled([
          getAllCompaniesServerAction(),
          listApplicationsAction(),
        ]);

        const normalizeList = (data: any) =>
          Array.isArray(data) ? data : data?.content || data?.data || [];

        if (companiesResult.status === 'fulfilled') {
          setCompanies(normalizeList(companiesResult.value));
          console.log('[formRole] companies:', normalizeList(companiesResult.value));
        } else {
          console.error('[formRole] error loading companies:', companiesResult.reason);
        }

        if (applicationsResult.status === 'fulfilled') {
          const rawApps = normalizeList(applicationsResult.value);
          const normalizedApps = rawApps.map((a: any) => ({
            ...a,
            id_application: a.id_application ?? a.idApplication ?? a.id,
            name: a.name ?? a.application_name ?? a.nombre,
          }));
          setApplications(normalizedApps);
          console.log('[formRole] applications:', normalizedApps);
        } else {
          console.error('[formRole] error loading applications:', applicationsResult.reason);
        }
      } catch (error) {
        console.error('Error loading base data:', error);
      } finally {
        setCompaniesLoading(false);
      }
    };

    loadBaseData();
  }, []);

  // Resolve company from initial company_application_id (editing)
  useEffect(() => {
    const resolveInitialCompany = async () => {
      const initialCompanyApplicationId = initialValues?.company_application_id;
      if (!initialCompanyApplicationId) return;

      try {
        const { getCompanyApplicationByIdServerAction } = await import('@/app/[locale]/(protected)/security/company-applications/actions');
        const companyApplication = await getCompanyApplicationByIdServerAction(Number(initialCompanyApplicationId));
        if (companyApplication?.company_id) {
          setValue('company_id', companyApplication.company_id, { shouldValidate: false });
          setValue('company_application_id', Number(initialCompanyApplicationId), { shouldValidate: false });
        }
      } catch (error) {
        console.error('Error resolving initial company:', error);
      }
    };

    resolveInitialCompany();
  }, [initialValues?.company_application_id]);

  // Load company applications when selected company changes
  useEffect(() => {
    const loadCompanyApplications = async () => {
      const selectedCompanyId = typeof companyId === 'number' ? companyId : Number(companyId);
      if (!selectedCompanyId) {
        setCompanyApplications([]);
        return;
      }

      try {
        setCompanyApplicationsLoading(true);
        const { getCompanyApplicationsByCompanyServerAction } = await import('@/app/[locale]/(protected)/security/company-applications/actions');
        const result = await getCompanyApplicationsByCompanyServerAction(selectedCompanyId);
        const list = Array.isArray(result) ? result : (result as any)?.content || (result as any)?.data || [];
        const normalized = list.map((ca: any) => ({
          ...ca,
          id_company_application: ca.id_company_application ?? ca.idCompanyApplication ?? ca.id,
          company_id: ca.company_id ?? ca.companyId,
          application_id: ca.application_id ?? ca.applicationId,
        }));
        setCompanyApplications(normalized);
        console.log('[formRole] companyApplications:', normalized);
      } catch (error) {
        console.error('[formRole] error loading company applications:', error);
        setCompanyApplications([]);
      } finally {
        setCompanyApplicationsLoading(false);
      }
    };

    loadCompanyApplications();
  }, [companyId]);

  const getCompanyApplicationLabel = (ca: any) => {
    const company = companies.find((c: any) => c.id_company === ca.company_id);
    const application = applications.find((a: any) => a.id_application === ca.application_id);
    const companyName = company?.name ?? `Empresa ${ca.company_id}`;
    const applicationName = application?.name ?? `Aplicación ${ca.application_id}`;
    return `${companyName} - ${applicationName}`;
  };

  const companyOptions = companies.map((company: any) => ({
    value: String(company.id_company),
    label: company.name ?? `Empresa ${company.id_company}`,
  }));

  const companyApplicationOptions = companyApplications
    .filter((ca: any) => Number.isFinite(Number(ca.id_company_application)))
    .map((ca: any) => ({
      id: String(ca.id_company_application),
      value: String(ca.id_company_application),
      label: getCompanyApplicationLabel(ca),
    }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField
          controller={{ control, name: "name" }}
          label={t("fields.name")}
          className='col-span-12'
        />

        <FormField
          controller={{ control, name: "description" }}
          label={t("fields.description")}
          className='col-span-12'
        />

        <FormSelectField
          controller={{ control, name: 'company_id' }}
          label="Empresa"
          placeholder="Seleccione una empresa"
          className='w-full col-span-12'
          triggerClassName='!w-full'
          searchable={true}
          data={companyOptions}
          emptyMessage="No hay empresas disponibles"
          disabled={companiesLoading || companies.length === 0}
          onValueChange={() => {
            setValue('company_application_id', undefined, { shouldValidate: false });
          }}
        />

        <FormSelectField
          controller={{ control, name: "company_application_id" }}
          label="Aplicación"
          placeholder={companyId ? "Seleccione una aplicación" : "Seleccione una empresa primero"}
          className='w-full col-span-12'
          triggerClassName='!w-full'
          searchable={true}
          data={companyApplicationOptions}
          emptyMessage="No hay aplicaciones disponibles para esta empresa"
          disabled={companyApplicationsLoading || !companyId}
          onValueChange={(value) => {
            const numeric = Number(value);
            if (Number.isFinite(numeric) && numeric > 0) {
              setValue('company_application_id', numeric, { shouldValidate: true });
            } else {
              setValue('company_application_id', undefined, { shouldValidate: true });
            }
          }}
        />

        <FormField
          controller={{ control, name: "manage_users" }}
          label={t("fields.manage_users")}
          type='checkbox'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "requires_approval" }}
          label={t("fields.requires_approval")}
          type='checkbox'
          className='col-span-12 md:col-span-6'
        />

        {/* <FormField
          controller={{ control, name: "approval_workflow" }}
          label={t("fields.approval_workflow")}
          className='col-span-12 md:col-span-6'
        /> */}
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
