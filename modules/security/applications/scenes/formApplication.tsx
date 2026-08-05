/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, FormSelectField } from "@repo/ui/form/scenes";
import { Buttons } from "@repo/ui/buttons";
import { IFormProps } from "@repo/ui/form/models";
import { useEffect, useMemo, useState } from "react";
import { IApplicationCategory } from "../../applications-category/models/applicationCategory.interface";
import { listApplicationsAction } from "../../role-permissions/actions/role.actions";
import { listApplicationsCategoriesAction } from "../actions/applicationsCategories.actions";

export const FormApplication = ({
  initialValues,
  validationSchema,
  onSubmit,
}: IFormProps<any>) => {
  const t = useTranslations("security.applications");
  const tCommon = useTranslations("common");
  type ApplicationInputs = z.infer<typeof validationSchema>;


  const [applicationCategoryData, setApplicationCategoryData] = useState<{
    menus: IApplicationCategory[];
    loading: boolean;
    error: string | null;
  }>({
    menus: [],
    loading: false,
    error: null,
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });



  useEffect(() => {
    const loadApplications = async () => {
      try {
        setApplicationCategoryData({ loading: true, menus: [], error: null });
        const result = await listApplicationsCategoriesAction();
        console.log(result)
        setApplicationCategoryData({ loading: false, menus: Array.isArray(result) ? result : [], error: null });
      } catch (error) {
        console.error('Error loading applications:', error);
        setApplicationCategoryData({ loading: false, menus: [], error: null });
      }
    };

    loadApplications();
  }, []);

  const opcionesMenus = useMemo(() => {
    return applicationCategoryData.menus
      .filter((menu) => menu.id_application_category !== initialValues?.id_application_category)
      .map((menu) => ({
        id: menu.id_application_category.toString(),
        value: menu.id_application_category.toString(),
        label: menu.name,
        disabled: false,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [applicationCategoryData.menus, initialValues?.id_application_category]);


  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField
          controller={{ control, name: "name" }}
          label={t("fields.name")}
          className='col-span-12'
        />

        <FormField
          controller={{ control, name: "publication_date" }}
          label={t("fields.publication_date")}
          type='date'
          className='col-span-12'
        />

        <FormSelectField
          controller={{ control, name: "application_category_id" }}
          label="Application Category"
          data={opcionesMenus}
          placeholder='Seleccionar menú padre...'
          disabled={applicationCategoryData.loading || !!applicationCategoryData.error}
          error={errors.application_category_id?.message}
          className='w-full col-span-12'
          triggerClassName='!w-full'
        />

        <FormField
          controller={{ control, name: "description" }}
          label={t("fields.description")}
          className='col-span-12'
        />

        {/* <FormSelectField
          controller={{ control, name: "company_id" }}
          label={t("fields.company_id")}
          data={opcionesNiveles}
          placeholder='Seleccionar nivel superior...'
          disabled={nivelesData.loading || !!nivelesData.error}
          // searchable={true}
          // emptyMessage={nivelesData.loading
          //   ? "Cargando niveles..."
          //   : nivelesData.error
          //     ? nivelesData.error
          //     : "No hay niveles disponibles"}
          error={errors.nivel_educativo?.message}
          className='w-full col-span-12 md:col-span-6'
          // @ts-ignore - El componente FormSelectField tiene un conflicto de tipos pero soporta estas props
          description='Nivel educativo al que pertenece (opcional)'
        /> */}

        <FormField
          controller={{ control, name: "maintenance_mode" }}
          label={t("fields.maintenance_mode")}
          type='checkbox'
          className='col-span-12 md:col-span-6'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
