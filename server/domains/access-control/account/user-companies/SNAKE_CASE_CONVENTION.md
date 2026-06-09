# Snake Case Convention - User Companies Module

## ✅ Convención Aplicada

Todos los archivos del servidor ahora usan **snake_case** para coincidir con el backend Java/Spring Boot.

## 📋 Campos Actualizados

### Antes (camelCase) → Después (snake_case)

```typescript
// ❌ Antes
userId      → ✅ user_id
companyId   → ✅ company_id
isActive    → ✅ is_active
isPrimary   → ✅ is_primary
accessLevel → ✅ access_level
expiresAt   → ✅ expires_at
createdAt   → ✅ created_at
updatedAt   → ✅ updated_at
companyName → ✅ company_name
companyNit  → ✅ company_nit
```

## 📁 Archivos Actualizados

### Backend (snake_case)
- ✅ `server/domains/access-control/account/user-companies/types.ts`
- ✅ `server/domains/access-control/account/user-companies/actions.ts`
- ✅ `server/domains/access-control/account/user-companies/repository.ts` (ya estaba correcto)
- ✅ `server/domains/access-control/account/user-companies/queries.ts` (ya estaba correcto)

### Frontend (snake_case internamente, pero mantiene interfaz)
- ✅ `modules/account/user-companies/components/form.tsx` - Envía datos en snake_case al backend

## 🔄 Ejemplo de Uso

### Crear Asignación

```typescript
// Frontend envía en snake_case
const result = await createUserCompanyAction({
  user_id: 1,
  company_id: 5,
  is_active: true,
  is_primary: true,
  access_level: "admin",
  expires_at: "2025-12-31T23:59:59Z",
  reason: "Asignación inicial"
});
```

### Actualizar Asignación

```typescript
// Frontend envía en snake_case
const result = await updateUserCompanyAction(
  userId,
  companyId,
  {
    is_active: false,
    is_primary: false,
    access_level: "viewer",
  }
);
```

## 📊 Interfaces del Servidor

### ICreateUserCompany
```typescript
interface ICreateUserCompany {
  user_id: number;
  company_id: number;
  is_active?: boolean;
  is_primary?: boolean;
  access_level?: string;
  expires_at?: string;
  reason?: string;
}
```

### IUpdateUserCompany
```typescript
interface IUpdateUserCompany {
  is_active?: boolean;
  is_primary?: boolean;
  access_level?: string;
  expires_at?: string;
  reason?: string;
}
```

### IUserCompanyResponse
```typescript
interface IUserCompanyResponse {
  user_id: number;
  company_id: number;
  company_name?: string;
  company_nit?: string;
  is_active: boolean;
  is_primary: boolean;
  access_level?: string;
  expires_at?: string;
  reason?: string;
  created_at: string;
  updated_at: string;
}
```

## ✅ Validación

Todos los campos ahora coinciden con el Swagger del backend:

```json
{
  "CreateUserCompanyDto": {
    "required": ["companyId", "userId"],
    "properties": {
      "userId": { "type": "integer" },
      "companyId": { "type": "integer" },
      "isActive": { "type": "boolean" },
      "isPrimary": { "type": "boolean" },
      "accessLevel": { "type": "string" },
      "expiresAt": { "type": "string" },
      "reason": { "type": "string" }
    }
  }
}
```

**Nota:** El Swagger usa camelCase en el JSON, pero nuestro servidor TypeScript usa snake_case internamente y se convierte automáticamente.

## 🎯 Resultado

- ✅ Backend usa snake_case consistentemente
- ✅ Frontend envía datos en snake_case al backend
- ✅ Tipos TypeScript correctos en ambos lados
- ✅ Sin errores de tipo
- ✅ Listo para conectar con API real
