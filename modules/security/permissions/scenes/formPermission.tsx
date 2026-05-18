/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes";
import { Buttons } from "@repo/ui/buttons";
import { IFormProps } from "@repo/ui/form/models";
import { FormSelectField } from "@repo/ui/form";

export const FormPermission = ({
  initialValues,
  validationSchema,
  onSubmit,
}: IFormProps<any>) => {
  const t = useTranslations("security.permissions");
  const tCommon = useTranslations("common");
  type PermissionInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PermissionInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const permissionTypeOptions = [
    { value: "API", label: "API" },
    { value: "APPLICATION", label: "Aplicación" },
    { value: "UI", label: "Interfaz" },
    { value: "SYSTEM", label: "Sistema" },
  ];

  const actionOptions = [
    { value: "CREATE", label: "Crear" },
    { value: "READ", label: "Leer" },
    { value: "UPDATE", label: "Actualizar" },
    { value: "DELETE", label: "Eliminar" },
    { value: "EXECUTE", label: "Ejecutar" },
    { value: "VIEW", label: "Ver" },
    { value: "MANAGE", label: "Gestionar" },
    { value: "ADMIN", label: "Administrar" },
    { value: "APPROVE", label: "Aprobar" },
    { value: "REJECT", label: "Rechazar" },
  ];

  // API Types and their methods
  const apiTypesData = [
    {
      apiType: "REST",
      category: "HTTP Methods",
      methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "HEAD",
        "OPTIONS",
        "TRACE",
        "CONNECT"
      ]
    },
    {
      apiType: "GraphQL",
      category: "Operations",
      methods: [
        "query",
        "mutation",
        "subscription"
      ]
    },
    {
      apiType: "gRPC",
      category: "RPC Methods",
      methods: [
        "Unary",
        "Server Streaming",
        "Client Streaming",
        "Bidirectional Streaming"
      ]
    },
    {
      apiType: "SOAP",
      category: "Operations",
      methods: [
        "Request",
        "Response",
        "Fault"
      ]
    },
    {
      apiType: "WebSockets",
      category: "Events",
      methods: [
        "connect",
        "message",
        "disconnect",
        "error",
        "ping",
        "pong"
      ]
    },
    {
      apiType: "RPC (general)",
      category: "Function Calls",
      methods: [
        "call",
        "notify"
      ]
    }
  ];

  const apiTypeOptions = apiTypesData.map(api => ({
    value: api.apiType,
    label: `${api.apiType} - ${api.category}`
  }));

  // Get methods based on selected API type
  const getMethodsForApiType = (apiType: string | undefined) => {
    if (!apiType) return [];
    const apiData = apiTypesData.find(api => api.apiType === apiType);
    return apiData?.methods.map(method => ({ value: method, label: method })) || [];
  };

  const selectedApiType = useWatch({ control, name: "api_type" });
  const methodOptions = getMethodsForApiType(selectedApiType);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {/* Información Básica */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Información Básica
        </h3>
        <div className='grid grid-cols-12 gap-4'>
          <FormField
            controller={{ control, name: "name" }}
            label={t("fields.name")}
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "description" }}
            label={t("fields.description")}
            className='col-span-12 md:col-span-6'
          />
        </div>
      </div>

      {/* Tipo y Definición del Permiso */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Tipo y Definición del Permiso
        </h3>
        <div className='grid grid-cols-12 gap-4'>
          {/* <FormField
            controller={{ control, name: "permission_type" }}
            label={t("fields.permission_type")}
            className='col-span-12 md:col-span-6'
          /> */}

          <FormSelectField
            controller={{ control, name: "permission_type" }}
            label={t("fields.permission_type")}
            data={permissionTypeOptions}
            placeholder='Seleccionar permission type...'
            // disabled={nivelesData.loading || !!nivelesData.error}
            // searchable={true}
            // emptyMessage={nivelesData.loading
            //   ? "Cargando niveles..."
            //   : nivelesData.error
            //     ? nivelesData.error
            //     : "No hay niveles disponibles"}
            error={errors.permission_type?.message}
            className='w-full col-span-12 md:col-span-6'
            // @ts-ignore - El componente FormSelectField tiene un conflicto de tipos pero soporta estas props
            description='Tipo de permiso'
          />

          <FormSelectField
            controller={{ control, name: "action" }}
            label={t("fields.action")}
            data={actionOptions}
            placeholder='Seleccionar nivel superior...'
            // disabled={nivelesData.loading || !!nivelesData.error}
            // searchable={true}
            // emptyMessage={nivelesData.loading
            //   ? "Cargando niveles..."
            //   : nivelesData.error
            //     ? nivelesData.error
            //     : "No hay niveles disponibles"}
            error={errors.action?.message}
            className='w-full col-span-12 md:col-span-6'
            // @ts-ignore - El componente FormSelectField tiene un conflicto de tipos pero soporta estas props
            description='Action'
          />

          {/* <FormField
            controller={{ control, name: "action" }}
            label={t("fields.action")}
            className='col-span-12 md:col-span-6'
          /> */}

          <FormField
            controller={{ control, name: "resource" }}
            label={t("fields.resource")}
            className='col-span-12 md:col-span-12'
          />
        </div>
      </div>

      {/* Asignación a Aplicación y Módulo */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Asignación a Aplicación y Módulo
        </h3>
        <div className='grid grid-cols-12 gap-4'>
          <FormField
            controller={{ control, name: "application_id" }}
            label={t("fields.application_id")}
            type='number'
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "module_id" }}
            label={t("fields.module_id")}
            type='number'
            className='col-span-12 md:col-span-6'
          />
        </div>
      </div>

      {/* Configuración Específica por Tipo */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Configuración Específica
        </h3>
        <div className='grid grid-cols-12 gap-4'>
          <FormSelectField
            controller={{ control, name: "api_type" }}
            label={t("fields.api_type")}
            data={apiTypeOptions}
            placeholder='Seleccionar tipo de API...'
            error={errors.api_type?.message}
            className='w-full col-span-12 md:col-span-6'
            description='Tipo de API para el permiso'
          />

          <FormSelectField
            controller={{ control, name: "http_method" }}
            label={t("fields.http_method")}
            data={methodOptions}
            placeholder={selectedApiType ? 'Seleccionar método...' : 'Primero selecciona un tipo de API'}
            disabled={!selectedApiType}
            error={errors.http_method?.message}
            className='w-full col-span-12 md:col-span-6'
            description='Método HTTP/Operación de la API'
          />

          <FormField
            controller={{ control, name: "endpoint_path" }}
            label={t("fields.endpoint_path")}
            placeholder='/api/resource/:id'
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "ui_component" }}
            label={t("fields.ui_component")}
            placeholder='Button, Modal, Form'
            className='col-span-12 md:col-span-6'
          />

          <FormField
            controller={{ control, name: "feature_flag" }}
            label={t("fields.feature_flag")}
            placeholder='feature_name'
            className='col-span-12 md:col-span-6'
          />
        </div>
      </div>

      {/* Configuración de Rendimiento y Seguridad */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Rendimiento y Seguridad
        </h3>
        <div className='grid grid-cols-12 gap-4'>
          <FormField
            controller={{ control, name: "priority" }}
            label={t("fields.priority")}
            type='number'
            className='col-span-12 md:col-span-4'
          />

          <FormField
            controller={{ control, name: "cache_ttl" }}
            label={t("fields.cache_ttl")}
            type='number'
            placeholder='3600'
            className='col-span-12 md:col-span-4'
          />

          <FormField
            controller={{ control, name: "is_sensitive" }}
            label={t("fields.is_sensitive")}
            type='checkbox'
            className='col-span-12 md:col-span-4'
          />
        </div>
      </div>

      {/* Metadata */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-900'>Metadata</h3>
        <div className='grid grid-cols-12 gap-4'>
          <FormField
            controller={{ control, name: "metadata" }}
            label={t("fields.metadata")}
            placeholder='{"key": "value"}'
            className='col-span-12 md:col-span-12'
          />
        </div>
      </div>

      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
