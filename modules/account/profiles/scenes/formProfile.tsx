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

export const FormProfile = ({
  initialValues,
  validationSchema,
  onSubmit,
}: IFormProps<any>) => {
  const t = useTranslations("account.profiles");
  const tCommon = useTranslations("common");
  type ProfileInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const themeOptions = [
    { value: "light", label: t("fields.themeOptions.light") },
    { value: "dark", label: t("fields.themeOptions.dark") },
    { value: "auto", label: t("fields.themeOptions.auto") },
  ];

  const timeFormatOptions = [
    { value: "12h", label: t("fields.timeFormatOptions.12h") },
    { value: "24h", label: t("fields.timeFormatOptions.24h") },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField
          controller={{ control, name: "userId" }}
          label={t("fields.userId"))
          type='number'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "display_name" }}
          label={t("fields.display_name"))
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "first_name" }}
          label={t("fields.first_name"))
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "last_name" }}
          label={t("fields.last_name"))
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "phone" }}
          label={t("fields.phone"))
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "avatar_url" }}
          label={t("fields.avatar_url"))
          type='url'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "timezone" }}
          label={t("fields.timezone"))
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "language" }}
          label={t("fields.language"))
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "theme" }}
          label={t("fields.theme"))
          data={themeOptions}
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "time_format" }}
          label={t("fields.time_format"))
          data={timeFormatOptions}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "bio" }}
          label={t("fields.bio"))
          className='col-span-12'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
