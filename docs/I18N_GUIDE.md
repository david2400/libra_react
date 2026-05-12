# Guía de Internacionalización (i18n) con next-intl

## 📋 Tabla de Contenidos

1. [Estructura de Traducciones](#estructura-de-traducciones)
2. [Convenciones de Nombres](#convenciones-de-nombres)
3. [Uso en Componentes](#uso-en-componentes)
4. [Uso en Schemas de Validación](#uso-en-schemas-de-validación)
5. [Mensajes Reutilizables](#mensajes-reutilizables)
6. [Ejemplo Completo](#ejemplo-completo)
7. [Mejores Prácticas](#mejores-prácticas)

---

## 🗂️ Estructura de Traducciones

Los archivos de traducción se encuentran en `messages/` y siguen esta estructura jerárquica:

```
messages/
├── en.json
├── es.json
└── [locale].json
```

### Estructura Interna de JSON

```json
{
  "common": { ... },           // Mensajes comunes reutilizables
  "validation": { ... },       // Mensajes de validación
  "messages": { ... },         // Mensajes del sistema (éxito, error)
  "account": {
    "clients": { ... },
    "companies": { ... },
    "profiles": { ... },
    "users": { ... }
  },
  "security": {
    "roles": { ... },
    "permissions": { ... },
    ...
  },
  "navigation": {
    "menus": { ... },
    ...
  }
}
```

---

## 📝 Convenciones de Nombres

### Namespaces

- **Formato**: `module.feature` (ej: `account.clients`, `security.roles`)
- **Organización**: Refleja la estructura de carpetas del proyecto
- **Consistencia**: Usar siempre el mismo patrón en todo el proyecto

### Keys (Claves)

- **Campos de formulario**: `camelCase` (ej: `name`, `email`, `companyName`)
- **Acciones**: `camelCase` con sufijo descriptivo (ej: `createButton`, `editButton`)
- **Secciones**: `snake_case` para subsecciones (ej: `modal.create_title`, `modal.edit_title`)

### Estructura de un Módulo

```json
{
  "account": {
    "clients": {
      "title": "Clientes",
      "description": "Gestión de Clientes",
      "subtitle": "Gestiona los clientes y sus datos de contacto",
      "createButton": "Crear Cliente",
      "editButton": "Editar Cliente",
      "fields": {
        "name": "Nombre",
        "email": "Correo Electrónico",
        "phone": "Teléfono"
      },
      "modal": {
        "create_title": "Crear Cliente",
        "edit_title": "Editar Cliente"
      },
      "metrics": {
        "total": "Total de clientes",
        "active": "Clientes activos"
      },
      "messages": {
        "createSuccess": "Cliente creado exitosamente",
        "updateSuccess": "Cliente actualizado exitosamente",
        "deleteSuccess": "Cliente eliminado exitosamente"
      }
    }
  }
}
```

---

## 🎨 Uso en Componentes

### Importar y Usar Traducciones

```tsx
"use client";

import { useTranslations } from "next-intl";

export const MyComponent = () => {
  // Namespace específico del módulo
  const t = useTranslations("account.clients");
  
  // Mensajes comunes
  const tCommon = useTranslations("common");

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("subtitle")}</p>
      <button>{tCommon("save")}</button>
    </div>
  );
};
```

### Múltiples Namespaces

```tsx
export const ClientForm = () => {
  const t = useTranslations("account.clients");
  const tCommon = useTranslations("common");
  const tMessages = useTranslations("messages");

  return (
    <form>
      <input placeholder={t("fields.name")} />
      <button>{tCommon("save")}</button>
      {/* Mensaje con interpolación */}
      <p>{tMessages("createSuccess", { entity: "cliente" })}</p>
    </form>
  );
};
```

### Traducciones con Parámetros

```tsx
// En el JSON
{
  "messages": {
    "createSuccess": "{entity} creado exitosamente"
  }
}

// En el componente
const message = tMessages("createSuccess", { entity: "Cliente" });
// Resultado: "Cliente creado exitosamente"
```

---

## ✅ Uso en Schemas de Validación

### Utilidad de Validación

Hemos creado una utilidad en `lib/i18n/validation-messages.ts`:

```typescript
import { useTranslations } from 'next-intl';

export const useValidationMessages = () => {
  const t = useTranslations('validation');

  return {
    required: t('required'),
    requiredField: t('requiredField'),
    invalidEmail: t('invalidEmail'),
    invalidPhone: t('invalidPhone'),
    minLength: (min: number) => t('minLength', { min }),
    maxLength: (max: number) => t('maxLength', { max }),
    // ... más validaciones
  };
};
```

### Uso en Schemas con Zod

```typescript
import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationClient = () => {
  const v = useValidationMessages();

  return z.object({
    name: z.string().min(1, { message: v.required }),
    email: z
      .string()
      .email({ message: v.invalidEmail })
      .optional()
      .or(z.literal('')),
    phone: z.string().optional(),
    companyName: z.string().optional(),
  });
};
```

### Validaciones con Parámetros

```typescript
export const validationUser = () => {
  const v = useValidationMessages();

  return z.object({
    username: z
      .string()
      .min(3, { message: v.minLength(3) })
      .max(20, { message: v.maxLength(20) }),
    password: z
      .string()
      .min(8, { message: v.minLength(8) }),
  });
};
```

---

## 🔄 Mensajes Reutilizables

### Namespace `common`

Mensajes de uso general en toda la aplicación:

```json
{
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "edit": "Editar",
    "delete": "Eliminar",
    "create": "Crear",
    "update": "Actualizar",
    "search": "Buscar",
    "actions": "Acciones",
    "status": "Estado",
    "active": "Activo",
    "inactive": "Inactivo"
  }
}
```

### Namespace `validation`

Mensajes de validación reutilizables:

```json
{
  "validation": {
    "required": "Este campo es requerido",
    "requiredField": "Campo requerido",
    "invalidEmail": "Correo electrónico inválido",
    "invalidPhone": "Número de teléfono inválido",
    "minLength": "Debe tener al menos {min} caracteres",
    "maxLength": "Debe tener máximo {max} caracteres"
  }
}
```

### Namespace `messages`

Mensajes del sistema con interpolación:

```json
{
  "messages": {
    "createSuccess": "{entity} creado exitosamente",
    "updateSuccess": "{entity} actualizado exitosamente",
    "deleteSuccess": "{entity} eliminado exitosamente",
    "createError": "Error al crear {entity}",
    "unexpectedError": "Ocurrió un error inesperado"
  }
}
```

---

## 📦 Ejemplo Completo

### 1. Schema (`schemas/client.schema.ts`)

```typescript
import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationClient = () => {
  const v = useValidationMessages();

  return z.object({
    name: z.string().min(1, { message: v.required }),
    email: z
      .string()
      .email({ message: v.invalidEmail })
      .optional()
      .or(z.literal('')),
    phone: z.string().optional(),
    companyName: z.string().optional(),
  });
};
```

### 2. Scene/Form (`scenes/formClient.tsx`)

```tsx
"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const FormClient = ({ initialValues, validationSchema, onSubmit }) => {
  const t = useTranslations("account.clients");
  const tCommon = useTranslations("common");

  const { control, handleSubmit, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        controller={{ control, name: "name" }}
        label={t("fields.name")}
      />
      <FormField
        controller={{ control, name: "email" }}
        label={t("fields.email")}
        type="email"
      />
      <button type="submit" disabled={isSubmitting}>
        {tCommon("save")}
      </button>
    </form>
  );
};
```

### 3. Component (`components/form.tsx`)

```tsx
"use client";

import { useTranslations } from "next-intl";
import Swal from "sweetalert2";

export const RegisterClient = () => {
  const t = useTranslations("account.clients.messages");
  const tMessages = useTranslations("messages");

  const handleSubmit = async (values) => {
    try {
      await clientsApi.create(values);
      
      Swal.fire({
        title: t("createSuccess"),
        icon: "success",
        timer: 3000,
      });
    } catch (error) {
      Swal.fire({
        title: tMessages("createError", { entity: "cliente" }),
        text: error?.message || tMessages("unexpectedError"),
        icon: "error",
      });
    }
  };

  return <FormClient onSubmit={handleSubmit} />;
};
```

### 4. Manager (`components/client-manager.tsx`)

```tsx
"use client";

import { useTranslations } from "next-intl";

export const ClientManager = ({ initialData }) => {
  const t = useTranslations("account.clients");
  const tCommon = useTranslations("common");

  const columns = [
    {
      accessorKey: "name",
      header: t("fields.name"),
    },
    {
      accessorKey: "email",
      header: t("fields.email"),
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
      <p>{t("subtitle")}</p>
      <button onClick={() => setOpenModal(true)}>
        {t("createButton")}
      </button>
      <DataTable data={initialData} columns={columns} />
    </div>
  );
};
```

---

## ✨ Mejores Prácticas

### 1. **Evitar Duplicación**

❌ **Incorrecto**:
```json
{
  "account": {
    "clients": {
      "saveButton": "Guardar"
    },
    "companies": {
      "saveButton": "Guardar"
    }
  }
}
```

✅ **Correcto**:
```json
{
  "common": {
    "save": "Guardar"
  }
}
```

### 2. **Usar Namespaces Específicos**

❌ **Incorrecto**:
```tsx
const t = useTranslations();
t("account.clients.fields.name")
```

✅ **Correcto**:
```tsx
const t = useTranslations("account.clients");
t("fields.name")
```

### 3. **Interpolación de Variables**

❌ **Incorrecto**:
```tsx
const message = `Cliente ${name} creado exitosamente`;
```

✅ **Correcto**:
```json
{
  "messages": {
    "createSuccessWithName": "{entity} {name} creado exitosamente"
  }
}
```

```tsx
const message = t("createSuccessWithName", { entity: "Cliente", name });
```

### 4. **Organización por Módulo**

Mantén la estructura de traducciones alineada con la estructura de carpetas:

```
modules/
  account/
    clients/
      ↓
messages/
  account.clients
```

### 5. **Consistencia en Nombres**

- **Campos**: `name`, `email`, `phone`
- **Acciones**: `createButton`, `editButton`, `deleteButton`
- **Modales**: `modal.create_title`, `modal.edit_title`
- **Métricas**: `metrics.total`, `metrics.active`
- **Mensajes**: `messages.createSuccess`, `messages.updateSuccess`

### 6. **Validaciones Centralizadas**

Siempre usa `useValidationMessages()` para schemas:

```typescript
import { useValidationMessages } from '@/lib/i18n';

export const mySchema = () => {
  const v = useValidationMessages();
  return z.object({
    field: z.string().min(1, { message: v.required })
  });
};
```

---

## 🚀 Cómo Extender a Nuevos Módulos

### Paso 1: Agregar Traducciones

Edita `messages/es.json` y `messages/en.json`:

```json
{
  "account": {
    "newModule": {
      "title": "Nuevo Módulo",
      "description": "Gestión del Módulo",
      "fields": {
        "field1": "Campo 1",
        "field2": "Campo 2"
      },
      "modal": {
        "create_title": "Crear Registro",
        "edit_title": "Editar Registro"
      },
      "messages": {
        "createSuccess": "Registro creado exitosamente",
        "updateSuccess": "Registro actualizado exitosamente"
      }
    }
  }
}
```

### Paso 2: Crear Schema

```typescript
// schemas/newModule.schema.ts
import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const validationNewModule = () => {
  const v = useValidationMessages();

  return z.object({
    field1: z.string().min(1, { message: v.required }),
    field2: z.string().optional(),
  });
};
```

### Paso 3: Crear Scene/Form

```tsx
// scenes/formNewModule.tsx
"use client";

import { useTranslations } from "next-intl";

export const FormNewModule = ({ initialValues, validationSchema, onSubmit }) => {
  const t = useTranslations("account.newModule");
  const tCommon = useTranslations("common");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField label={t("fields.field1")} />
      <button>{tCommon("save")}</button>
    </form>
  );
};
```

### Paso 4: Crear Component

```tsx
// components/form.tsx
"use client";

import { useTranslations } from "next-intl";

export const RegisterNewModule = () => {
  const t = useTranslations("account.newModule.messages");
  const tMessages = useTranslations("messages");

  const handleSubmit = async (values) => {
    try {
      await api.create(values);
      Swal.fire({ title: t("createSuccess"), icon: "success" });
    } catch (error) {
      Swal.fire({ 
        title: tMessages("createError", { entity: "registro" }),
        icon: "error" 
      });
    }
  };

  return <FormNewModule onSubmit={handleSubmit} />;
};
```

---

## 📚 Recursos Adicionales

- [Documentación oficial de next-intl](https://next-intl-docs.vercel.app/)
- [Configuración en `i18n/request.ts`](../i18n/request.ts)
- [Utilidades de validación](../lib/i18n/validation-messages.ts)
- [Ejemplo completo: módulo clients](../modules/account/clients/)

---

## 🎯 Checklist para Nuevos Módulos

- [ ] Agregar traducciones en `messages/es.json` y `messages/en.json`
- [ ] Crear schema usando `useValidationMessages()`
- [ ] Usar `useTranslations()` en scenes/forms
- [ ] Usar `useTranslations()` en components
- [ ] Usar `useTranslations()` en managers
- [ ] Reemplazar todos los textos hardcodeados
- [ ] Usar mensajes de `common` para acciones generales
- [ ] Usar mensajes de `validation` para validaciones
- [ ] Usar mensajes de `messages` para feedback del sistema
- [ ] Verificar consistencia en nombres de keys

---

**Última actualización**: Mayo 2026
