/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes";
import { Buttons } from "@repo/ui/buttons";
import { IFormProps } from "@repo/ui/form/models";
import { IApplication } from "@/server/domains/access-control/security/applications";
import { useEffect, useMemo, useState } from "react";
import { getAllApplications } from "../actions/modules-applications.action";
import { FormSelectField } from "@repo/ui/form";
import {
  IModuleApplication,
  getModuleApplications,
} from "@/server/domains/access-control/security/modules_applications";
import { getAllModuleApplicationsServerAction } from "@/app/[locale]/(protected)/security/modules-applications/actions";

export const FormModuleApplication = ({
  initialValues,
  validationSchema,
  onSubmit,
}: IFormProps<any>) => {
  const t = useTranslations("security.modulesApplications");
  const tCommon = useTranslations("common");
  type ModuleApplicationInputs = z.infer<typeof validationSchema>;

  const [applicationsData, setApplications] = useState<{
    data: IApplication[];
    loading: boolean;
    error: string | null;
  }>({
    data: [],
    loading: false,
    error: null,
  });

  const [moduleApplicationsData, setModuleApplications] = useState<{
    data: IModuleApplication[];
    loading: boolean;
    error: string | null;
  }>({
    data: [],
    loading: false,
    error: null,
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ModuleApplicationInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

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

  const cargarModuleApplications = async () => {
    try {
      setModuleApplications((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      const applications = await getAllModuleApplicationsServerAction();
      console.log("applications", applications);
      setModuleApplications({
        data: applications,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error cargando applications educativos:", error);
      setModuleApplications({
        data: [],
        loading: false,
        error: "No se pudieron cargar los applications educativos",
      });
    }
  };

  // Memoizar opciones para evitar recálculos
  const opcionesModuleApplications = useMemo(() => {
    return moduleApplicationsData.data
      .filter((nivel) => nivel.id_modules_application != null) // Filtrar módulos sin ID
      .map((nivel) => ({
        id: nivel.id_modules_application.toString(),
        value: nivel.id_modules_application.toString(),
        label: `${nivel.name}`,
        disabled: false,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)); // Ordenar alfabéticamente
  }, [moduleApplicationsData.data, initialValues?.id]);

  useEffect(() => {
    let isMounted = true;

    // cargarCompanys();
    cargarApplications();
    cargarModuleApplications();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField
          controller={{ control, name: "name" }}
          label={t("fields.name")}
          type='text'
          className='col-span-12 md:col-span-6'
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

        <FormField
          controller={{ control, name: "description" }}
          label={t("fields.description")}
          type='textarea'
          className='col-span-12'
        />

        <FormSelectField
          controller={{ control, name: "parent_module_application_id" }}
          label={t("fields.parent_module_application_id")}
          data={opcionesModuleApplications}
          placeholder='Seleccionar aplicación...'
          error={errors.parent_module_application_id?.message}
          className='w-full col-span-12 md:col-span-6'
          description='Aplicación asignada'
        />

        <FormField
          controller={{ control, name: "level" }}
          label={t("fields.level")}
          type='number'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "path" }}
          label={t("fields.path")}
          type='text'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "publication_date" }}
          label={t("fields.publication_date")}
          type='date'
          className='col-span-12 md:col-span-6'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
