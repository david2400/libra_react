# 🌍 Sistema de Internacionalización (i18n)

## 📋 Resumen Ejecutivo

Se ha implementado un sistema completo y escalable de internacionalización usando **next-intl** para el proyecto Next.js.

---

## ✅ Lo que se ha Implementado

### 1. **Infraestructura Completa**

#### Archivos de Mensajes
- ✅ `messages/es.json` - Traducciones en español (361 líneas)
- ✅ `messages/en.json` - Traducciones en inglés (361 líneas)

**Estructura organizada por:**
```
common          → Mensajes reutilizables (save, edit, delete, etc.)
validation      → Validaciones (required, invalidEmail, etc.)
messages        → Sistema (createSuccess, updateSuccess, etc.)
account         → clients, companies, profiles, users
security        → roles, permissions, applications, policies, etc.
navigation      → menus, menuPermissions, roleMenus
```

#### Utilidades
- ✅ `lib/i18n/validation-messages.ts` - Hook para validaciones
- ✅ `lib/i18n/index.ts` - Exportaciones centralizadas

### 2. **Módulos Implementados**

#### ✅ account/clients (100% completado)
- Schema con validaciones traducidas
- Formulario (scene) con traducciones
- Componentes con mensajes traducidos
- Manager completamente traducido

#### ✅ account/companies (100% completado)
- Schema con validaciones traducidas
- Formulario con traducciones
- Componentes con mensajes traducidos
- Opciones de select traducidas (sizeOptions)

### 3. **Documentación**

- ✅ `docs/I18N_GUIDE.md` - Guía completa (500+ líneas)
  - Estructura de traducciones
  - Convenciones de nombres
  - Uso en componentes
  - Uso en schemas
  - Mensajes reutilizables
  - Ejemplo completo
  - Mejores prácticas
  - Cómo extender a nuevos módulos

- ✅ `docs/I18N_TEMPLATES.md` - Plantillas reutilizables
  - Plantilla JSON
  - Plantilla de Schema
  - Plantilla de Scene/Form
  - Plantilla de Component
  - Plantilla de Manager

- ✅ `docs/I18N_IMPLEMENTATION_STATUS.md` - Estado de implementación
  - Módulos completados
  - Módulos pendientes
  - Patrón de actualización
  - Checklist por módulo

---

## 🎯 Convenciones Establecidas

### Namespaces
```typescript
// Formato: module.feature
"account.clients"
"security.roles"
"navigation.menus"
```

### Keys
```typescript
// Campos: camelCase
"name", "email", "companyName"

// Acciones: camelCase con sufijo
"createButton", "editButton"

// Secciones: snake_case
"modal.create_title", "modal.edit_title"
```

### Uso en Código

**Componentes:**
```typescript
const t = useTranslations("account.clients");
const tCommon = useTranslations("common");

<h1>{t("title")}</h1>
<button>{tCommon("save")}</button>
```

**Schemas:**
```typescript
import { useValidationMessages } from '@/lib/i18n';

const v = useValidationMessages();
z.string().min(1, { message: v.required })
z.string().email({ message: v.invalidEmail })
```

**Mensajes del Sistema:**
```typescript
const tMessages = useTranslations("messages");

Swal.fire({
  title: tMessages("createSuccess", { entity: "Cliente" })
});
```

---

## 📦 Estructura de Archivos Creados/Modificados

```
libra/
├── messages/
│   ├── es.json                          ✅ Actualizado
│   └── en.json                          ✅ Actualizado
│
├── lib/
│   └── i18n/
│       ├── validation-messages.ts       ✅ Creado
│       └── index.ts                     ✅ Creado
│
├── modules/
│   └── account/
│       ├── clients/
│       │   ├── schemas/client.schema.ts           ✅ Actualizado
│       │   ├── scenes/formClient.tsx              ✅ Actualizado
│       │   └── components/
│       │       ├── form.tsx                       ✅ Actualizado
│       │       └── client-manager.tsx             ✅ Actualizado
│       │
│       └── companies/
│           ├── schemas/company.schema.ts          ✅ Actualizado
│           ├── scenes/formCompany.tsx             ✅ Actualizado
│           └── components/
│               └── form.tsx                       ✅ Actualizado
│
└── docs/
    ├── I18N_GUIDE.md                    ✅ Creado
    ├── I18N_TEMPLATES.md                ✅ Creado
    ├── I18N_IMPLEMENTATION_STATUS.md    ✅ Creado
    └── README_I18N.md                   ✅ Creado (este archivo)
```

---

## 🚀 Cómo Usar

### 1. En un Componente

```typescript
"use client";

import { useTranslations } from "next-intl";

export const MyComponent = () => {
  const t = useTranslations("account.clients");
  const tCommon = useTranslations("common");

  return (
    <div>
      <h1>{t("title")}</h1>
      <button>{tCommon("save")}</button>
    </div>
  );
};
```

### 2. En un Schema

```typescript
import { z } from 'zod';
import { useValidationMessages } from '@/lib/i18n';

export const mySchema = () => {
  const v = useValidationMessages();

  return z.object({
    name: z.string().min(1, { message: v.required }),
    email: z.string().email({ message: v.invalidEmail }),
  });
};
```

### 3. En Mensajes del Sistema

```typescript
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";

const t = useTranslations("account.clients.messages");
const tMessages = useTranslations("messages");

// Mensaje específico del módulo
Swal.fire({ title: t("createSuccess") });

// Mensaje genérico con interpolación
Swal.fire({ 
  title: tMessages("createSuccess", { entity: "Cliente" })
});
```

---

## 📝 Próximos Pasos

Para completar la implementación en los módulos restantes, seguir el patrón documentado en:

1. **Guía principal**: `docs/I18N_GUIDE.md`
2. **Plantillas**: `docs/I18N_TEMPLATES.md`
3. **Estado**: `docs/I18N_IMPLEMENTATION_STATUS.md`

### Módulos Pendientes

**Alta prioridad:**
- account/profiles
- account/users

**Media prioridad:**
- security/roles
- security/permissions

**Baja prioridad:**
- Resto de módulos de security
- Módulos de navigation

---

## ✨ Beneficios

1. **Escalable** - Fácil agregar nuevos idiomas
2. **Mantenible** - Estructura clara y organizada
3. **Type-safe** - Soporte completo de TypeScript
4. **Reutilizable** - Mensajes comunes centralizados
5. **Consistente** - Convenciones claras
6. **Documentado** - Guías completas y ejemplos

---

## 🔧 Solución de Problemas

### Errores de TypeScript en módulos @repo/ui

Los errores de lint relacionados con `@repo/ui/*` son de módulos externos del monorepo y no están relacionados con la implementación de i18n. Estos módulos existen en el proyecto pero TypeScript no los encuentra en este momento.

### Namespace no encontrado

Si un namespace no se encuentra, verificar:
1. Que exista en `messages/es.json` y `messages/en.json`
2. Que el path sea correcto (ej: `account.clients` no `AccessControl.account.clients`)
3. Que la estructura JSON sea válida

---

## 📚 Recursos

- [Documentación oficial de next-intl](https://next-intl-docs.vercel.app/)
- [Configuración en i18n/request.ts](i18n/request.ts)
- [Ejemplo completo: módulo clients](modules/account/clients/)
- [Guía completa](docs/I18N_GUIDE.md)

---

**Última actualización**: Mayo 2026  
**Estado**: ✅ Infraestructura completa | 🔄 Implementación en progreso
