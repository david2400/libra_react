/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import { IFormProps } from "@repo/ui/form/models/form.interface";

export const FormUser = ({
  initialValues,
  validationSchema,
  onSubmit,
}: IFormProps<any>) => {
  const intl = useTranslations("AccessControl.account.users");
  const intlActions = useTranslations("AccessControl.actions");
  type UserInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField
          controller={{ control, name: "username" }}
          label={intl("fields.username")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "password" }}
          label={intl("fields.password")}
          type='password'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "status" }}
          label={intl("fields.status")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "companyId" }}
          label={intl("fields.companyId")}
          type='number'
          className='col-span-12 md:col-span-6'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {intlActions("saveUser")}
      </Buttons>
    </form>
  );
};
