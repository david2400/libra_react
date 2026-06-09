# User-Companies Page

## 📋 Descripción

Página principal para la gestión de asignaciones de usuarios a empresas.

## 📁 Estructura de Archivos

```
app/[locale]/(protected)/account/user-companies/
├── page.tsx       # Página principal
├── actions.ts     # Server Actions
└── README.md      # Esta documentación
```

## 🎯 Funcionalidad

### page.tsx
- Carga datos de user-companies, usuarios y empresas
- Renderiza el componente `UserCompanyManager`
- Maneja errores de carga de datos
- Genera metadata para SEO

### actions.ts
- `createUserCompanyServerAction()` - Crear asignación
- `updateUserCompanyServerAction()` - Actualizar asignación
- `deleteUserCompanyServerAction()` - Eliminar asignación
- `getAllUserCompaniesServerAction()` - Listar todas las asignaciones
- `getUserCompaniesServerAction()` - Empresas de un usuario
- `getUserActiveCompaniesServerAction()` - Empresas activas de un usuario
- `getCompanyUsersServerAction()` - Usuarios de una empresa
- `getCompanyActiveUsersServerAction()` - Usuarios activos de una empresa

## 🔗 Dependencias

### Backend
- `@/server/domains/access-control/account/user-companies` - Módulo del servidor
- `@/server/domains/access-control/account/users` - Para cargar usuarios
- `@/server/domains/access-control/account/companies` - Para cargar empresas

### Frontend
- `@/modules/account/user-companies` - Componentes UI

## 🚀 Uso

### Acceder a la página
```
/account/user-companies
```

### Datos cargados
1. **User-Companies**: Todas las asignaciones existentes
2. **Users**: Lista completa de usuarios
3. **Companies**: Lista completa de empresas

## 📊 Flujo de Datos

```
page.tsx
  ↓
  ├─→ getAllUserCompaniesServerAction() → IUserCompanyResponse[]
  ├─→ getUsers() → IUser[]
  └─→ getCompanies() → ICompany[]
  ↓
UserCompanyManager (renderizado con los datos)
```

## 🎨 Características

- ✅ **Metadata SEO**: Título y descripción traducidos
- ✅ **Error Handling**: Manejo robusto de errores
- ✅ **Type Safety**: TypeScript completo
- ✅ **Server Actions**: Para operaciones CRUD
- ✅ **Carga de Datos**: Múltiples fuentes en paralelo

## 📝 Notas

- La página es un Server Component (async)
- Los datos se cargan en el servidor antes del renderizado
- Los errores no bloquean el renderizado, se muestran arrays vacíos
- Las Server Actions se importan desde `./actions.ts`

## 🔄 Actualización de Datos

Los datos se revalidan automáticamente cuando:
- Se crea una nueva asignación
- Se actualiza una asignación existente
- Se elimina una asignación
- Se navega de vuelta a la página

## 🌐 Traducciones Requeridas

```json
{
  "account": {
    "userCompanies": {
      "title": "Asignación de Empresas",
      "description": "Gestiona las empresas asignadas a cada usuario"
    }
  }
}
```
