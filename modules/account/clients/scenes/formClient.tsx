/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, FormSelect, FormSelectField } from "@repo/ui/form/scenes";
import { Buttons } from "@repo/ui/buttons";
import { IFormProps } from "@repo/ui/form/models";

export const FormClient = ({
  initialValues,
  validationSchema,
  onSubmit,
}: IFormProps<any>) => {
  const t = useTranslations("account.clients");
  const tCommon = useTranslations("common");
  type ClientInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  console.log(errors);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        {/* Nombres */}
        <FormField
          controller={{ control, name: "first_name" }}
          label='Primer Nombre'
          className='col-span-12 md:col-span-6'
          required
        />

        <FormField
          controller={{ control, name: "second_name" }}
          label='Segundo Nombre'
          className='col-span-12 md:col-span-6'
        />

        {/* Apellidos */}
        <FormField
          controller={{ control, name: "first_last_name" }}
          label='Primer Apellido'
          className='col-span-12 md:col-span-6'
          required
        />

        <FormField
          controller={{ control, name: "second_last_name" }}
          label='Segundo Apellido'
          className='col-span-12 md:col-span-6'
        />

        {/* Identificación */}
        <FormSelectField
          controller={{ control, name: "type_id" }}
          label='Tipo de Identificación'
          type='select'
          data={[
            {
              id: "CC",
              value: "CC",
              label: "Cédula de Ciudadanía",
              disabled: false,
            },
            {
              id: "TI",
              value: "TI",
              label: "Tarjeta de Identidad",
              disabled: false,
            },
            {
              id: "CE",
              value: "CE",
              label: "Cédula de Extranjería",
              disabled: false,
            },
            { id: "PA", value: "PA", label: "Pasaporte", disabled: false },
            { id: "RC", value: "RC", label: "Registro Civil", disabled: false },
          ]}
          className='w-full col-span-12 md:col-span-6'
          required
        />

        <FormField
          controller={{ control, name: "card_id" }}
          label='Número de Identificación'
          className='col-span-12 md:col-span-6'
          required
        />

        {/* Sexo y Género */}
        <FormSelectField
          controller={{ control, name: "sex" }}
          label='Sexo'
          type='select'
          data={[
            { value: "M", label: "Masculino" },
            { value: "F", label: "Femenino" },
            { value: "I", label: "Intersexual" },
          ]}
          className='w-full col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "gender" }}
          label='Género'
          type='select'
          data={[
            { value: "Masculino", label: "Masculino" },
            { value: "Femenino", label: "Femenino" },
            { value: "No binario", label: "No binario" },
            { value: "Otro", label: "Otro" },
            { value: "Prefiero no decir", label: "Prefiero no decir" },
          ]}
          className='w-full col-span-12 md:col-span-6'
        />
        
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
