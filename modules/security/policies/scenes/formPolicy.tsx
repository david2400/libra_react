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

export const FormPolicy = ({
  initialValues,
  validationSchema,
  onSubmit,
}: IFormProps<any>) => {
  const intl = useTranslations("AccessControl.security.policies");
  const intlActions = useTranslations("AccessControl.actions");
  type PolicyInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PolicyInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const effectOptions = [
    { value: "ALLOW", label: intl("fields.effectOptions.ALLOW") },
    { value: "DENY", label: intl("fields.effectOptions.DENY") },
    { value: "NOT_APPLICABLE", label: intl("fields.effectOptions.NOT_APPLICABLE") },
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
          controller={{ control, name: "application_id" }}
          label={intl("fields.application_id")}
          type='number'
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "default_effect" }}
          label={intl("fields.default_effect")}
          data={effectOptions}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "priority" }}
          label={intl("fields.priority")}
          type='number'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "is_active" }}
          label={intl("fields.is_active")}
          type='checkbox'
          className='col-span-12 md:col-span-6'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {intlActions("savePolicy")}
      </Buttons>
    </form>
  );
};
