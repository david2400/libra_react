/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes";
import { Buttons } from "@repo/ui/buttons";
import { IFormProps } from "@repo/ui/form/models";
import { FormSelectField } from "@repo/ui/form";

export const FormApplication = ({
  initialValues,
  validationSchema,
  onSubmit,
}: IFormProps<any>) => {
  const t = useTranslations("security.applications");
  const tCommon = useTranslations("common");
  type ApplicationInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const statusOptions = [
    { id: "active", value: "active", label: t("fields.statusOptions.active") },
    { id: "inactive", value: "inactive", label: t("fields.statusOptions.inactive") },
    { id: "maintenance", value: "maintenance", label: t("fields.statusOptions.maintenance") },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField
          controller={{ control, name: "name" }}
          label={t("fields.name")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "version" }}
          label={t("fields.version")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "description" }}
          label={t("fields.description")}
          className='col-span-12'
        />

        <FormField
          controller={{ control, name: "baseUrl" }}
          label={t("fields.baseUrl")}
          type='url'
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "status" }}
          label={t("fields.status")}
          data={statusOptions}
          placeholder='Seleccionar estado...'
          className='w-full col-span-12 md:col-span-6'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
