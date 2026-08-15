/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FormField,
  FormSelectField,
  FormTextAreaField,
  FormTreeSelectField,
} from "@repo/ui/form/scenes";
import { Buttons } from "@repo/ui/buttons";
import { IFormProps } from "@repo/ui/form/models";
import { useEffect, useMemo, useState } from "react";
import { IMenu } from "../models/menu.interface";
import { IApplication } from "@/server/domains/access-control/security/applications";
import { getAllApplicationsServerAction } from "@/app/[locale]/(protected)/security/applications/actions";
import type { TreeSelectNode } from "@repo/ui/inputs/scenes/tree-select";

interface FormMenuProps extends IFormProps<any> {
  availableMenus?: IMenu[];
}

const getDescendantIds = (menu: IMenu): number[] => {
  const ids: number[] = [];
  const collect = (item: IMenu) => {
    ids.push(item.id_menu);
    item.children?.forEach(collect);
  };
  menu.children?.forEach(collect);
  return ids;
};

const buildMenuTreeNodes = (
  flatMenus: IMenu[],
  currentMenuId?: number,
): TreeSelectNode[] => {
  if (!flatMenus?.length) return [];

  const current = currentMenuId
    ? flatMenus.find((m) => m.id_menu === currentMenuId)
    : undefined;
  const disabledIds = current
    ? new Set([currentMenuId, ...getDescendantIds(current)])
    : new Set<number | undefined>();

  const map = new Map<number, IMenu & { children: IMenu[] }>();
  flatMenus.forEach((menu) => {
    map.set(menu.id_menu, { ...menu, children: [] });
  });

  const roots: IMenu[] = [];
  map.forEach((menu) => {
    const parentId = menu.parent_menu_id;
    if (parentId == null || parentId === 0 || parentId === menu.id_menu) {
      roots.push(menu);
    } else {
      const parent = map.get(parentId);
      if (parent) {
        parent.children.push(menu);
      } else {
        roots.push(menu);
      }
    }
  });

  const sortByName = (a: IMenu, b: IMenu) => a.name.localeCompare(b.name);
  const sortRecursively = (items: IMenu[]) => {
    items.sort(sortByName);
    items.forEach((item) => {
      if (item.children?.length) sortRecursively(item.children);
    });
  };
  sortRecursively(roots);

  const toNode = (menu: IMenu): TreeSelectNode => ({
    value: menu.id_menu.toString(),
    label: menu.name,
    disabled: disabledIds.has(menu.id_menu),
    children: menu.children?.length ? menu.children.map(toNode) : undefined,
  });

  return roots.map(toNode);
};

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

  const [applicationsData, setApplications] = useState<{
    data: IApplication[];
    loading: boolean;
    error: string | null;
  }>({
    data: [],
    loading: false,
    error: null,
  });

  const cargarApplications = async () => {
    try {
      setApplications((prev) => ({ ...prev, loading: true, error: null }));

      const applications = await getAllApplicationsServerAction();
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

  useEffect(() => {
    if (availableMenus.length > 0) {
      setMenusData({
        menus: availableMenus,
        loading: false,
        error: null,
      });
    }
  }, [availableMenus]);

  useEffect(() => {
    let isMounted = true;

    // cargarCompanys();
    cargarApplications();

    return () => {
      isMounted = false;
    };
  }, []);

  const menuTreeNodes = useMemo(() => {
    return buildMenuTreeNodes(
      menusData.menus,
      initialValues?.id_menu,
    );
  }, [menusData.menus, initialValues?.id_menu]);

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
  
  console.log("opcionesApplications", errors);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormSelectField
          controller={{ control, name: "application_id" }}
          label={t("fields.application_id")}
          data={opcionesApplications}
          placeholder='Seleccionar aplicación...'
          error={errors.application_id?.message}
          className='w-full col-span-12 md:col-span-6'
          triggerClassName='!w-full'
          // description='Aplicación asignada'
        />

        <FormField
          controller={{ control, name: "name" }}
          label={t("fields.name")}
          className='col-span-12 md:col-span-6'
        />

        <FormTextAreaField
          controller={{ control, name: "description" }}
          label={t("fields.description")}
          className='col-span-12'
        />

        <FormField
          controller={{ control, name: "path" }}
          label={t("fields.path")}
          className='col-span-12'
        />
        {/* <FormField
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
        /> */}

        {/* <FormField
          controller={{ control, name: "port" }}
          label={t("fields.port")}
          type='number'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "path" }}
          label={t("fields.path")}
          className='col-span-12 md:col-span-6'
        /> */}

        {/* <FormField
          controller={{ control, name: "sort_order" }}
          label={t("fields.sort_order")}
          type='number'
          className='col-span-12 md:col-span-6'
        /> */}

        <FormTreeSelectField
          controller={{ control, name: "parent_menu_id" }}
          label={t("fields.parent_id")}
          nodes={menuTreeNodes}
          placeholder='Seleccionar menú padre...'
          searchPlaceholder='Buscar menú...'
          emptyMessage={
            menusData.loading
              ? "Cargando menús..."
              : menusData.error
                ? menusData.error
                : "No hay menús disponibles"
          }
          disabled={menusData.loading || !!menusData.error}
          error={errors.parent_menu_id?.message?.toString()}
          className='w-full col-span-12 md:col-span-6'
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
