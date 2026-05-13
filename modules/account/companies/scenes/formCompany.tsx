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

export const FormCompany = ({
  initialValues,
  validationSchema,
  onSubmit,
}: IFormProps<any>) => {
  const t = useTranslations("account.companies");
  const tCommon = useTranslations("common");
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
    { value: "small", label: t("fields.sizeOptions.small") },
    { value: "medium", label: t("fields.sizeOptions.medium") },
    { value: "large", label: t("fields.sizeOptions.large") },
    { value: "enterprise", label: t("fields.sizeOptions.enterprise") },
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
          controller={{ control, name: "industry" }}
          label={t("fields.industry")}
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "size" }}
          label={t("fields.size"))
          data={sizeOptions}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "website" }}
          label={t("fields.website"))
          type='url'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "email" }}
          label={t("fields.email"))
          type='email'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "phone" }}
          label={t("fields.phone"))
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "city" }}
          label={t("fields.city"))
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "country" }}
          label={t("fields.country"))
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "address" }}
          label={t("fields.address"))
          className='col-span-12'
        />

        <FormField
          controller={{ control, name: "description" }}
          label={t("fields.description"))
          className='col-span-12'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
