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

export const FormCompany = ({
  initialValues,
  validationSchema,
  onSubmit,
}: IFormProps<any>) => {
  const intl = useTranslations("AccessControl.account.companies");
  const intlActions = useTranslations("AccessControl.actions");
  type CompanyInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const sizeOptions = [
    { value: "small", label: "Pequeña" },
    { value: "medium", label: "Mediana" },
    { value: "large", label: "Grande" },
    { value: "enterprise", label: "Empresa" },
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
          controller={{ control, name: "industry" }}
          label={intl("fields.industry")}
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "size" }}
          label={intl("fields.size")}
          options={sizeOptions}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "website" }}
          label={intl("fields.website")}
          type='url'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "email" }}
          label={intl("fields.email")}
          type='email'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "phone" }}
          label={intl("fields.phone")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "city" }}
          label={intl("fields.city")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "country" }}
          label={intl("fields.country")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "address" }}
          label={intl("fields.address")}
          className='col-span-12'
        />

        <FormField
          controller={{ control, name: "description" }}
          label={intl("fields.description")}
          className='col-span-12'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {intlActions("saveCompany")}
      </Buttons>
    </form>
  );
};
