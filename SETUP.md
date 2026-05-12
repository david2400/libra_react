# Configuración del Proyecto Libra

## ✅ Problemas Resueltos

### 1. Error de next-intl ✅
**Problema**: `Couldn't find next-intl config file`  
**Solución**: Se corrigió la ruta en `i18n/request.ts` de `../../messages` a `../messages`

### 2. Configuración del Backend

Para resolver el error de conexión al backend, crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Backend API URL
LIBRA_API_BASE_URL=http://localhost:3001

# O si usas otro puerto/host:
# LIBRA_API_BASE_URL=http://localhost:8000
# LIBRA_API_BASE_URL=https://api.tudominio.com
```

### 3. Configuración de Next.js (Opcional)

El warning sobre `turbo` en `next.config.ts` es solo una advertencia. Si quieres eliminarlo, verifica la documentación de Next.js 16.2.4 para las opciones experimentales válidas.

## 🚀 Pasos para Iniciar

1. **Crear archivo de variables de entorno**:
   ```bash
   # En la raíz del proyecto (apps/libra/)
   cp .env.example .env.local  # Si existe .env.example
   # O crear manualmente .env.local con el contenido de arriba
   ```

2. **Asegurarse de que el backend esté corriendo**:
   ```bash
   # El backend debe estar corriendo en el puerto configurado
   # Por defecto: http://localhost:3001
   ```

3. **Iniciar el proyecto**:
   ```bash
   npm run dev
   ```

## 📝 Notas

- El archivo `.env.local` está en `.gitignore` y no se subirá al repositorio
- Asegúrate de que el backend esté corriendo antes de iniciar el frontend
- Los mensajes de i18n están en la carpeta `messages/` (es.json, en.json)

## 🎉 Migración Completada

La migración de camelCase a snake_case está 100% completa en todo el dominio `access-control`:
- ✅ 18 módulos migrados
- ✅ ~72 archivos actualizados
- ✅ Todas las propiedades en snake_case
