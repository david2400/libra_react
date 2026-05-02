/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import { IFormProps } from "@repo/ui/form/models/form.interface";

export const FormRoleMenu = ({
  initialValues,
  validationSchema,
  onSubmit,
}: IFormProps<any>) => {
  const intl = useTranslations("AccessControl.navigation.roleMenus");
  const intlActions = useTranslations("AccessControl.actions");
  type RoleMenuInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RoleMenuInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField
          controller={{ control, name: "roleId" }}
          label={intl("fields.roleId")}
          type='number'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "menuId" }}
          label={intl("fields.menuId")}
          type='number'
          className='col-span-12 md:col-span-6'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {intlActions("saveRoleMenu")}
      </Buttons>
    </form>
  );
};
