/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes";
import { FormSelectField } from "@repo/ui/form/scenes";
import { Buttons } from "@repo/ui/buttons";
import { IFormProps } from "@repo/ui/form/models";
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
  const t = useTranslations("navigation.menus");
  const tCommon = useTranslations("common");
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
      .filter((menu) => menu.id_menu !== initialValues?.id_menu)
      .map((menu) => ({
        id: menu.id_menu.toString(),
        value: menu.id_menu.toString(),
        label: menu.name,
        disabled: false,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [menusData.menus, initialValues?.id_menu]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField
          controller={{ control, name: "application_id" }}
          label={t("fields.application_id")}
          type='number'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "name" }}
          label={t("fields.name")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "protocol" }}
          label={t("fields.protocol")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "subdomain" }}
          label={t("fields.subdomain")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "url" }}
          label={t("fields.url")}
          type='url'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "port" }}
          label={t("fields.port")}
          type='number'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "path" }}
          label={t("fields.path")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "sort_order" }}
          label={t("fields.sort_order")}
          type='number'
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "parent_id" }}
          label={t("fields.parent_id")}
          data={opcionesMenus}
          placeholder='Seleccionar menú padre...'
          disabled={menusData.loading || !!menusData.error}
          error={errors.parent_id?.message}
          className='w-full col-span-12 md:col-span-6'
          description='Menú padre (opcional)'
        />

        <FormField
          controller={{ control, name: "icon" }}
          label={t("fields.icon")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "visible" }}
          label={t("fields.visible")}
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
