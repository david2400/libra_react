/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import { IFormProps } from "@repo/ui/form/models/form.interface";
import { useEffect, useMemo, useState } from "react";
import { IMenu } from "../models/menu.interface";

interface FormMenuProps extends IFormProps<any> {
  availableMenus?: IMenu[];
}

export const FormMenu = ({
  initialValues,
  validationSchema,
  onSubmit,
  availableMenus = [],
}: FormMenuProps) => {
  const intl = useTranslations("AccessControl.navigation.menus");
  const intlOptions = useTranslations("AccessControl.options");
  const intlActions = useTranslations("AccessControl.actions");
  type MenuInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MenuInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const [menusData, setMenusData] = useState<{
    menus: IMenu[];
    loading: boolean;
    error: string | null;
  }>({
    menus: availableMenus,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (availableMenus.length > 0) {
      setMenusData({
        menus: availableMenus,
        loading: false,
        error: null,
      });
    }
  }, [availableMenus]);

  const opcionesMenus = useMemo(() => {
    return menusData.menus
      .filter((menu) => menu.id !== initialValues?.id)
      .map((menu) => ({
        id: menu.id.toString(),
        value: menu.id.toString(),
        label: menu.label || menu.name,
        disabled: false,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [menusData.menus, initialValues?.id]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField
          controller={{ control, name: "name" }}
          label={intl("fields.name")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "label" }}
          label={intl("fields.label")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "icon" }}
          label={intl("fields.icon")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "path" }}
          label={intl("fields.path")}
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "parentId" }}
          label={intl("fields.parentId")}
          data={opcionesMenus}
          placeholder='Seleccionar menú padre...'
          disabled={menusData.loading || !!menusData.error}
          error={errors.parentId?.message}
          className='w-full col-span-12 md:col-span-6'
          description='Menú padre (opcional)'
        />

        <FormField
          controller={{ control, name: "order" }}
          label={intl("fields.order")}
          type='number'
          className='col-span-12 md:col-span-6'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {intlActions("saveMenu")}
      </Buttons>
    </form>
  );
};
