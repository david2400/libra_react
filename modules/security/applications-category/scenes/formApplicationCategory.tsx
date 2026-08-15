/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FormField,
  FormTextAreaField,
  FormTreeSelectField,
} from "@repo/ui/form/scenes";
import { Buttons } from "@repo/ui/buttons";
import { IFormProps } from "@repo/ui/form/models";
import { useEffect, useMemo, useState } from "react";
import { IApplicationCategory } from "../models/applicationCategory.interface";
import type { TreeSelectNode } from "@repo/ui/inputs/scenes/tree-select";

interface FormApplicationCategoryProps extends IFormProps<any> {
  availableApplicationCategory?: IApplicationCategory[];
}

const getParentCategoryId = (
  category: IApplicationCategory,
): number | null | undefined =>
  category.parent_category_application_id ??
  category.application_category_id ??
  category.parent_category_application?.id_application_category;

const getDescendantIds = (category: IApplicationCategory): number[] => {
  const ids: number[] = [];
  const collect = (item: IApplicationCategory) => {
    ids.push(item.id_application_category);
    item.children?.forEach(collect);
  };
  category.children?.forEach(collect);
  return ids;
};

const buildApplicationCategoryTreeNodes = (
  flatCategories: IApplicationCategory[],
  currentCategoryId?: number,
): TreeSelectNode[] => {
  if (!flatCategories?.length) return [];

  const current = currentCategoryId
    ? flatCategories.find((c) => c.id_application_category === currentCategoryId)
    : undefined;
  const disabledIds = current
    ? new Set([currentCategoryId, ...getDescendantIds(current)])
    : new Set<number | undefined>();

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
    disabled: disabledIds.has(category.id_application_category),
    children: category.children?.length ? category.children.map(toNode) : undefined,
  });

  return roots.map(toNode);
};

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



  const categoryTreeNodes = useMemo(() => {
    return buildApplicationCategoryTreeNodes(
      applicationCategoryData.menus,
      initialValues?.id_application_category,
    );
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
        
        <FormTreeSelectField
          controller={{ control, name: "parent_category_application_id" }}
          label={t("fields.parent_id")}
          nodes={categoryTreeNodes}
          placeholder='Seleccionar categoría padre...'
          searchPlaceholder='Buscar categoría...'
          emptyMessage={
            applicationCategoryData.loading
              ? "Cargando categorías..."
              : applicationCategoryData.error
                ? applicationCategoryData.error
                : "No hay categorías disponibles"
          }
          disabled={applicationCategoryData.loading || !!applicationCategoryData.error}
          error={errors.parent_category_application_id?.message?.toString()}
          className='w-full col-span-12'
        />

       
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
