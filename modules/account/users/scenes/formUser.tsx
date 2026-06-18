/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, FormSelectField } from "@repo/ui/form/scenes";
import { Buttons } from "@repo/ui/buttons";
import { IFormProps } from "@repo/ui/form/models";
import { useEffect, useMemo, useState } from "react";
import { listClientsServerAction } from "@/server/domains/access-control/account/clients";

interface IClient {
  id_client?: number;
  first_name?: string;
  second_name?: string;
  first_last_name?: string;
  second_last_name?: string;
  type_id?: string;
  card_id?: string;
  status?: string;
}

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

  const [clientsData, setClientsData] = useState<{
    data: IClient[];
    loading: boolean;
    error: string | null;
  }>({
    data: [],
    loading: false,
    error: null,
  });

  const cargarClients = async () => {
    try {
      setClientsData((prev) => ({ ...prev, loading: true, error: null }));

      const response = await listClientsServerAction();

      setClientsData({
        data: response ?? [],
        loading: false,
        error: null,
      });

    } catch (error) {
      console.error("Error cargando clientes:", error);
      setClientsData({
        data: [],
        loading: false,
        error: "Error de conexión al cargar clientes",
      });
    }
  };

  useEffect(() => {
    let isMounted = true;
    console.log("cargando clients");
    cargarClients();
    return () => {
      isMounted = false;
    };
  }, []);
  console.log("error", errors);
  const opcionesClients = useMemo(() => {
    return clientsData.data
      .filter((client) => client.id_client !== undefined)
      .map((client) => ({
        id: client.id_client!.toString(),
        value: client.id_client!.toString(),
        label:
          `${client.first_name || ""} ${client.first_last_name || ""}`.trim() ||
          "Sin nombre",
        disabled: false,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [clientsData.data]);

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
        {/* 
        <FormField
          controller={{ control, name: "status" }}
          label={intl("fields.status")}
          className='col-span-12 md:col-span-6'
        /> */}
        {/* 
        <FormField
          controller={{ control, name: "company_id" }}
          label={intl("fields.companyId")}
          type='number'
          className='col-span-12 md:col-span-6'
        /> */}

        <div className='col-span-12 md:col-span-6 space-y-2'>
          <FormSelectField
            controller={{ control, name: "client_id" }}
            label={intl("fields.clientId")}
            data={opcionesClients}
            placeholder='Seleccionar cliente...'
            error={errors.client_id?.message}
            className='w-full'
            description='Cliente asignado'
            disabled={clientsData.loading || !!clientsData.error}
          />

          {/* Estado de carga y errores */}
          {clientsData.loading && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span>Cargando clientes...</span>
            </div>
          )}

          {clientsData.error && (
            <div className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded text-sm">
              <span className="text-red-700">{clientsData.error}</span>
              <button
                onClick={cargarClients}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Reintentar
              </button>
            </div>
          )}

          {!clientsData.loading && !clientsData.error && opcionesClients.length === 0 && (
            <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
              No hay clientes disponibles para asignar
            </div>
          )}
        </div>
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {intlActions("saveUser")}
      </Buttons>
    </form>
  );
};
