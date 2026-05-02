/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import { IFormProps } from "@repo/ui/form/models/form.interface";

export const FormClient = ({
  initialValues,
  validationSchema,
  onSubmit,
}: IFormProps<any>) => {
  const intl = useTranslations("AccessControl.account.clients");
  const intlActions = useTranslations("AccessControl.actions");
  type ClientInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField
          controller={{ control, name: "name" }}
          label={intl("fields.name")}
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
          controller={{ control, name: "companyName" }}
          label={intl("fields.companyName")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "contactPerson" }}
          label={intl("fields.contactPerson")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "city" }}
          label={intl("fields.city")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "address" }}
          label={intl("fields.address")}
          className='col-span-12'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {intlActions("saveClient")}
      </Buttons>
    </form>
  );
};
