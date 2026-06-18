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

  // State for applications
  const [applications, setApplications] = useState<any[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RoleInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  // Load applications on mount
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setApplicationsLoading(true);
        const { listApplicationsAction } = await import('../../role-permissions/actions/actions');
        const result = await listApplicationsAction();
        setApplications(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error('Error loading applications:', error);
        setApplications([]);
      } finally {
        setApplicationsLoading(false);
      }
    };

    loadApplications();
  }, []);

  // Format applications for FormSelectField
  const applicationOptions = applications.map((app: any) => ({
    id: app.id_application,
    value: app.id_application,
    label: app.name,
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
          controller={{ control, name: "application_id" }}
          label="Aplicación"
          placeholder="Seleccione una aplicación"
          className='w-full col-span-12'
          triggerClassName='!w-full'
          searchable={true}
          data={applicationOptions}
          emptyMessage="No hay aplicaciones disponibles"
          disabled={applicationsLoading}
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
