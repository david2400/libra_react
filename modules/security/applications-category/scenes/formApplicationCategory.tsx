/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, FormTextAreaField } from "@repo/ui/form/scenes";
import { FormSelectField } from "@repo/ui/form/scenes";
import { Buttons } from "@repo/ui/buttons";
import { IFormProps } from "@repo/ui/form/models";
import { useEffect, useMemo, useState } from "react";
import { IApplicationCategory } from "../models/applicationCategory.interface";

interface FormApplicationCategoryProps extends IFormProps<any> {
  availableApplicationCategory?: IApplicationCategory[];
}

export const FormApplicationCategory = ({
  initialValues,
  validationSchema,
  onSubmit,
  availableApplicationCategory = [],
}: FormApplicationCategoryProps) => {
  const t = useTranslations("navigation.menus");
  const tCommon = useTranslations("common");
  type ApplicationCategoriesInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationCategoriesInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const [applicationCategoryData, setApplicationCategoryData] = useState<{
    menus: IApplicationCategory[];
    loading: boolean;
    error: string | null;
  }>({
    menus: availableApplicationCategory,
    loading: false,
    error: null,
  });


  useEffect(() => {
    if (availableApplicationCategory.length > 0) {
      setApplicationCategoryData({
        menus: availableApplicationCategory,
        loading: false,
        error: null,
      });
    }
  }, [availableApplicationCategory]);



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

        <FormTextAreaField
          controller={{ control, name: "description" }}
          label={t("fields.description")}
          className='col-span-12'
        />
        
        <FormSelectField
          controller={{ control, name: "parent_category_application_id" }}
          label={t("fields.parent_id")}
          data={opcionesMenus}
          placeholder='Seleccionar menú padre...'
          disabled={applicationCategoryData.loading || !!applicationCategoryData.error}
          error={errors.parent_category_application_id?.message}
          className='w-full col-span-12'
          triggerClassName='!w-full'
          // description='Menú padre (opcional)'
        />

       
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
