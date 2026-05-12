# Estado de Implementación de i18n

## ✅ Completado

### Infraestructura
- ✅ Archivos de mensajes (`messages/es.json`, `messages/en.json`)
- ✅ Utilidades de validación (`lib/i18n/validation-messages.ts`)
- ✅ Documentación completa (`docs/I18N_GUIDE.md`)
- ✅ Plantillas reutilizables (`docs/I18N_TEMPLATES.md`)

### Módulos Implementados
- ✅ **account/clients** - Completamente traducido
  - Schema con validaciones
  - Formularios (scenes)
  - Componentes (form, client-manager)
  
- ✅ **account/companies** - Completamente traducido
  - Schema con validaciones
  - Formularios (scenes)
  - Componentes (form)

---

## 🔄 Pendiente de Implementación

### account/profiles
**Archivos a actualizar:**
1. `modules/account/profiles/schemas/profile.schema.ts`
   - Cambiar `useTranslations('Form')` por `useValidationMessages()`
   
2. `modules/account/profiles/scenes/formProfile.tsx`
   - Cambiar `useTranslations("AccessControl.account.profiles")` por `useTranslations("account.profiles")`
   - Cambiar `useTranslations("AccessControl.actions")` por `useTranslations("common")`
   - Actualizar todas las referencias de `intl` a `t`
   - Actualizar `intlActions` a `tCommon`

3. `modules/account/profiles/components/form.tsx`
   - Agregar hooks de traducción
   - Actualizar mensajes de Swal con traducciones

4. `modules/account/profiles/components/profile-manager.tsx`
   - Actualizar namespaces de traducciones
   - Reemplazar textos hardcodeados

---

### account/users
**Archivos a actualizar:**
1. `modules/account/users/schemas/user.schema.ts`
   - Usar `useValidationMessages()`
   
2. `modules/account/users/scenes/formUser.tsx`
   - Actualizar namespaces a `account.users`
   
3. `modules/account/users/components/form.tsx`
   - Agregar traducciones para mensajes

4. `modules/account/users/components/user-manager.tsx`
   - Actualizar traducciones

---

### security/roles
**Archivos a actualizar:**
1. `modules/security/roles/schemas/role.schema.ts`
2. `modules/security/roles/scenes/formRole.tsx`
3. `modules/security/roles/components/form.tsx`
4. `modules/security/roles/components/role-manager.tsx`

**Namespace:** `security.roles`

---

### security/permissions
**Archivos a actualizar:**
1. `modules/security/permissions/schemas/permission.schema.ts`
2. `modules/security/permissions/scenes/formPermission.tsx`
3. `modules/security/permissions/components/form.tsx`
4. `modules/security/permissions/components/permission-manager.tsx`

**Namespace:** `security.permissions`

---

### security/applications
**Archivos a actualizar:**
1. `modules/security/applications/schemas/application.schema.ts`
2. `modules/security/applications/scenes/formApplication.tsx`
3. `modules/security/applications/components/form.tsx`
4. `modules/security/applications/components/application-manager.tsx`

**Namespace:** `security.applications`

---

### security/module-applications
**Archivos a actualizar:**
1. `modules/security/modules-applications/schemas/module-application.schema.ts`
2. `modules/security/modules-applications/scenes/formModuleApplication.tsx`
3. `modules/security/modules-applications/components/form.tsx`
4. `modules/security/modules-applications/components/module-application-manager.tsx`

**Namespace:** `security.moduleApplications`

---

### security/policies
**Archivos a actualizar:**
1. `modules/security/policies/schemas/policy.schema.ts`
2. `modules/security/policies/scenes/formPolicy.tsx`
3. `modules/security/policies/components/form.tsx`
4. `modules/security/policies/components/policy-manager.tsx`

**Namespace:** `security.policies`

---

### security/role-permissions
**Archivos a actualizar:**
1. `modules/security/role-permissions/schemas/role-permission.schema.ts`
2. `modules/security/role-permissions/scenes/formRolePermission.tsx`
3. `modules/security/role-permissions/components/form.tsx`
4. `modules/security/role-permissions/components/role-permission-manager.tsx`

**Namespace:** `security.rolePermissions`

---

### navigation/menus
**Archivos a actualizar:**
1. `modules/navigation/menus/schemas/menu.schema.ts`
2. `modules/navigation/menus/scenes/formMenu.tsx`
3. `modules/navigation/menus/components/form.tsx`
4. `modules/navigation/menus/components/menu-manager.tsx`

**Namespace:** `navigation.menus`

---

### navigation/menu-permissions
**Archivos a actualizar:**
1. `modules/navigation/menu-permissions/schemas/menu-permission.schema.ts`
2. `modules/navigation/menu-permissions/scenes/formMenuPermission.tsx`
3. `modules/navigation/menu-permissions/components/form.tsx`
4. `modules/navigation/menu-permissions/components/menu-permission-manager.tsx`

**Namespace:** `navigation.menuPermissions`

---

### navigation/role-menus
**Archivos a actualizar:**
1. `modules/navigation/role-menus/schemas/role-menu.schema.ts`
2. `modules/navigation/role-menus/scenes/formRoleMenu.tsx`
3. `modules/navigation/role-menus/components/form.tsx`
4. `modules/navigation/role-menus/components/role-menu-manager.tsx`

**Namespace:** `navigation.roleMenus`

---

## 📝 Patrón de Actualización

Para cada módulo, seguir estos pasos:

### 1. Schema
```typescript
// Antes
import { useTranslations } from 'next-intl';
const intl = useTranslations('Form');
z.string().min(1, { message: intl('requiredField') })

// Después
import { useValidationMessages } from '@/lib/i18n';
const v = useValidationMessages();
z.string().min(1, { message: v.required })
```

### 2. Scenes
```typescript
// Antes
const intl = useTranslations("AccessControl.module.feature");
const intlActions = useTranslations("AccessControl.actions");

// Después
const t = useTranslations("module.feature");
const tCommon = useTranslations("common");
```

### 3. Components
```typescript
// Antes
Swal.fire({ title: "Entidad creada exitosamente" });

// Después
const t = useTranslations("module.feature.messages");
const tMessages = useTranslations("messages");
Swal.fire({ title: t("createSuccess") });
```

### 4. Managers
```typescript
// Antes
<button>Editar</button>

// Después
const tCommon = useTranslations("common");
<button>{tCommon("edit")}</button>
```

---

## 🎯 Prioridad de Implementación

1. **Alta**: account/profiles, account/users
2. **Media**: security/roles, security/permissions
3. **Baja**: Resto de módulos de security y navigation

---

## ✅ Checklist por Módulo

- [ ] Actualizar schema con `useValidationMessages()`
- [ ] Actualizar scene con namespaces correctos
- [ ] Actualizar component con traducciones
- [ ] Actualizar manager con traducciones
- [ ] Reemplazar todos los textos hardcodeados
- [ ] Verificar que no queden referencias a `AccessControl`
- [ ] Probar formulario de creación
- [ ] Probar formulario de edición
- [ ] Verificar mensajes de error

---

**Última actualización**: Mayo 2026
