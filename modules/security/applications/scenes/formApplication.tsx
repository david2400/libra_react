/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, FormTreeSelectField } from "@repo/ui/form/scenes";
import { Buttons } from "@repo/ui/buttons";
import { IFormProps } from "@repo/ui/form/models";
import { useEffect, useMemo, useState } from "react";
import { IApplicationCategory } from "../../applications-category/models/applicationCategory.interface";
import { listApplicationsAction } from "../../role-permissions/actions/role.actions";
import { listApplicationsCategoriesAction } from "../actions/applicationsCategories.actions";
import type { TreeSelectNode } from "@repo/ui/inputs/scenes/tree-select";

const getParentCategoryId = (
  category: IApplicationCategory,
): number | null | undefined =>
  category.parent_category_application_id ??
  category.application_category_id ??
  category.parent_category_application?.id_application_category;

const buildApplicationCategoryTreeNodes = (
  flatCategories: IApplicationCategory[],
): TreeSelectNode[] => {
  if (!flatCategories?.length) return [];

  const map = new Map<number, IApplicationCategory & { children: IApplicationCategory[] }>();
  flatCategories.forEach((category) => {
    map.set(category.id_application_category, { ...category, children: [] });
  });

  const roots: IApplicationCategory[] = [];
  map.forEach((category) => {
    const parentId = getParentCategoryId(category);
    if (parentId == null || parentId === 0 || parentId === category.id_application_category) {
      roots.push(category);
    } else {
      const parent = map.get(parentId);
      if (parent) {
        parent.children.push(category);
      } else {
        roots.push(category);
      }
    }
  });

  const sortByName = (a: IApplicationCategory, b: IApplicationCategory) =>
    a.name.localeCompare(b.name);
  const sortRecursively = (items: IApplicationCategory[]) => {
    items.sort(sortByName);
    items.forEach((item) => {
      if (item.children?.length) sortRecursively(item.children);
    });
  };
  sortRecursively(roots);

  const toNode = (category: IApplicationCategory): TreeSelectNode => ({
    value: category.id_application_category.toString(),
    label: category.name,
    children: category.children?.length ? category.children.map(toNode) : undefined,
  });

  return roots.map(toNode);
};

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

  const categoryTreeNodes = useMemo(() => {
    return buildApplicationCategoryTreeNodes(applicationCategoryData.menus);
  }, [applicationCategoryData.menus]);


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

        <FormTreeSelectField
          controller={{ control, name: "application_category_id" }}
          label={t("fields.application_category_id")}
          nodes={categoryTreeNodes}
          placeholder='Seleccionar categoría...'
          searchPlaceholder='Buscar categoría...'
          emptyMessage={
            applicationCategoryData.loading
              ? "Cargando categorías..."
              : applicationCategoryData.error
                ? applicationCategoryData.error
                : "No hay categorías disponibles"
          }
          disabled={applicationCategoryData.loading || !!applicationCategoryData.error}
          error={errors.application_category_id?.message?.toString()}
          className='w-full col-span-12'
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
