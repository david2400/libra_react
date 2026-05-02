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

export const FormProfile = ({
  initialValues,
  validationSchema,
  onSubmit,
}: IFormProps<any>) => {
  const intl = useTranslations("AccessControl.account.profiles");
  const intlActions = useTranslations("AccessControl.actions");
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
    { value: "light", label: "Claro" },
    { value: "dark", label: "Oscuro" },
    { value: "auto", label: "Automático" },
  ];

  const timeFormatOptions = [
    { value: "12h", label: "12 horas" },
    { value: "24h", label: "24 horas" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField
          controller={{ control, name: "userId" }}
          label={intl("fields.userId")}
          type='number'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "display_name" }}
          label={intl("fields.display_name")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "first_name" }}
          label={intl("fields.first_name")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "last_name" }}
          label={intl("fields.last_name")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "phone" }}
          label={intl("fields.phone")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "avatar_url" }}
          label={intl("fields.avatar_url")}
          type='url'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "timezone" }}
          label={intl("fields.timezone")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "language" }}
          label={intl("fields.language")}
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "theme" }}
          label={intl("fields.theme")}
          options={themeOptions}
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "time_format" }}
          label={intl("fields.time_format")}
          options={timeFormatOptions}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "bio" }}
          label={intl("fields.bio")}
          className='col-span-12'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {intlActions("saveProfile")}
      </Buttons>
    </form>
  );
};
