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

export const FormApplication = ({
  initialValues,
  validationSchema,
  onSubmit,
}: IFormProps<any>) => {
  const intl = useTranslations("AccessControl.security.applications");
  const intlActions = useTranslations("AccessControl.actions");
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
    { id: "active", value: "active", label: "Activo" },
    { id: "inactive", value: "inactive", label: "Inactivo" },
    { id: "maintenance", value: "maintenance", label: "Mantenimiento" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField
          controller={{ control, name: "name" }}
          label={intl("fields.name")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "version" }}
          label={intl("fields.version")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "description" }}
          label={intl("fields.description")}
          className='col-span-12'
        />

        <FormField
          controller={{ control, name: "baseUrl" }}
          label={intl("fields.baseUrl")}
          type='url'
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "status" }}
          label={intl("fields.status")}
          data={statusOptions}
          placeholder='Seleccionar estado...'
          className='w-full col-span-12 md:col-span-6'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {intlActions("saveApplication")}
      </Buttons>
    </form>
  );
};
