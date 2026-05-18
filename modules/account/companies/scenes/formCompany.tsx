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
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
      {/* Información Básica */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-900'>Información Básica</h3>
        <div className='grid grid-cols-12 gap-4'>
          <FormField
            controller={{ control, name: "name" }}
            label={t("fields.name")}
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "nit" }}
            label={t("fields.nit")}
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "active_date" }}
            label={t("fields.active_date")}
            type='date'
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "status" }}
            label={t("fields.status")}
            className='col-span-12 md:col-span-6'
          />
        </div>
      </div>

      {/* Información de Contacto */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-900'>Información de Contacto</h3>
        <div className='grid grid-cols-12 gap-4'>
          <FormField
            controller={{ control, name: "email" }}
            label={t("fields.email")}
            type='email'
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "phone" }}
            label={t("fields.phone")}
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "website" }}
            label={t("fields.website")}
            type='url'
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "contact_person" }}
            label={t("fields.contact_person")}
            className='col-span-12 md:col-span-6'
          />
        </div>
      </div>

      {/* Dirección */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-900'>Dirección</h3>
        <div className='grid grid-cols-12 gap-4'>
          <FormField
            controller={{ control, name: "address" }}
            label={t("fields.address")}
            className='col-span-12'
          />

          <FormField
            controller={{ control, name: "city" }}
            label={t("fields.city")}
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "country" }}
            label={t("fields.country")}
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "postal_code" }}
            label={t("fields.postal_code")}
            className='col-span-12 md:col-span-6'
          />
        </div>
      </div>

      {/* Datos Fiscales y Legales */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-900'>Datos Fiscales y Legales</h3>
        <div className='grid grid-cols-12 gap-4'>
          <FormField
            controller={{ control, name: "legal_representative" }}
            label={t("fields.legal_representative")}
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "tax_regime" }}
            label={t("fields.tax_regime")}
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "economic_activity" }}
            label={t("fields.economic_activity")}
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "employee_count" }}
            label={t("fields.employee_count")}
            type='number'
            className='col-span-12 md:col-span-6'
          />
        </div>
      </div>

      {/* Configuración y Estado */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-900'>Configuración y Estado</h3>
        <div className='grid grid-cols-12 gap-4'>
          <FormField
            controller={{ control, name: "timezone" }}
            label={t("fields.timezone")}
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "currency" }}
            label={t("fields.currency")}
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "language" }}
            label={t("fields.language")}
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "verification_date" }}
            label={t("fields.verification_date")}
            type='date'
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "is_active" }}
            label={t("fields.is_active")}
            type='checkbox'
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "is_verified" }}
            label={t("fields.is_verified")}
            type='checkbox'
            className='col-span-12 md:col-span-6'
          />
        </div>
      </div>

      {/* Límites y Configuración del Plan */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-900'>Límites y Configuración del Plan</h3>
        <div className='grid grid-cols-12 gap-4'>
          <FormField
            controller={{ control, name: "max_users" }}
            label={t("fields.max_users")}
            type='number'
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "max_applications" }}
            label={t("fields.max_applications")}
            type='number'
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "subscription_type" }}
            label={t("fields.subscription_type")}
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "subscription_start_date" }}
            label={t("fields.subscription_start_date")}
            type='date'
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "subscription_end_date" }}
            label={t("fields.subscription_end_date")}
            type='date'
            className='col-span-12 md:col-span-6'
          />
        </div>
      </div>

      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
