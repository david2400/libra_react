# Plantillas de Internacionalización

## 📋 Plantilla JSON para Nuevos Módulos

```json
{
  "moduleName": {
    "featureName": {
      "title": "Título del Módulo",
      "description": "Descripción del Módulo",
      "subtitle": "Subtítulo descriptivo",
      "createButton": "Crear [Entidad]",
      "editButton": "Editar [Entidad]",
      "fields": {
        "field1": "Campo 1",
        "field2": "Campo 2"
      },
      "modal": {
        "create_title": "Crear [Entidad]",
        "edit_title": "Editar [Entidad]"
      },
      "metrics": {
        "total": "Total de [entidades]",
        "active": "[Entidades] activas"
      },
      "messages": {
        "createSuccess": "[Entidad] creado exitosamente",
        "updateSuccess": "[Entidad] actualizado exitosamente",
        "deleteSuccess": "[Entidad] eliminado exitosamente"
      }
    }
  }
}
```

## 🔧 Plantilla de Schema

```typescript
import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validation[EntityName] = () => {
  const v = useValidationMessages();

  return z.object({
    field1: z.string().min(1, { message: v.required }),
    field2: z.string().email({ message: v.invalidEmail }).optional(),
    field3: z.string().min(3, { message: v.minLength(3) }),
  });
};
```

## 🎨 Plantilla de Scene/Form

```typescript
"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const Form[EntityName] = ({ initialValues, validationSchema, onSubmit }) => {
  const t = useTranslations("[module].[feature]");
  const tCommon = useTranslations("common");

  const { control, handleSubmit, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        controller={{ control, name: "field1" }}
        label={t("fields.field1")}
      />
      <button type="submit" disabled={isSubmitting}>
        {tCommon("save")}
      </button>
    </form>
  );
};
```

## 📦 Plantilla de Component

```typescript
"use client";

import { useTranslations } from "next-intl";
import Swal from "sweetalert2";

export const Register[EntityName] = () => {
  const t = useTranslations("[module].[feature].messages");
  const tMessages = useTranslations("messages");

  const handleSubmit = async (values) => {
    try {
      await api.create(values);
      
      Swal.fire({
        title: t("createSuccess"),
        icon: "success",
        timer: 3000,
      });
    } catch (error) {
      Swal.fire({
        title: tMessages("createError", { entity: "[entidad]" }),
        text: error?.message || tMessages("unexpectedError"),
        icon: "error",
      });
    }
  };

  return <Form[EntityName] onSubmit={handleSubmit} />;
};
```

## 🗂️ Plantilla de Manager

```typescript
"use client";

import { useTranslations } from "next-intl";

export const [EntityName]Manager = ({ initialData }) => {
  const t = useTranslations("[module].[feature]");
  const tCommon = useTranslations("common");

  const columns = [
    {
      accessorKey: "field1",
      header: t("fields.field1"),
    },
    {
      header: tCommon("status"),
      cell: ({ row }) => (
        <span>
          {row.original.isActive ? tCommon("active") : tCommon("inactive")}
        </span>
      ),
    },
    {
      header: tCommon("actions"),
      cell: ({ row }) => (
        <button onClick={() => handleEdit(row.original)}>
          {tCommon("edit")}
        </button>
      ),
    },
  ];

  return (
    <div>
      <h1>{t("description")}</h1>
      <button onClick={() => setOpenModal(true)}>
        {t("createButton")}
      </button>
      <DataTable data={initialData} columns={columns} />
    </div>
  );
};
```
