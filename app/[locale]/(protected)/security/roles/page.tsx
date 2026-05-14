/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";

import { RoleManager } from "@/modules/security/roles";

import {
  IRole,
  getRoles,
} from "@/server/domains/access-control/security/roles";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "security.roles" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const RolesPage: NextPage = async () => {
  try {
    const rolesResponse = await getRoles();

    // Extract the data array from the paginated response
    const rolesData: IRole[] = Array.isArray(rolesResponse)
      ? rolesResponse
      : rolesResponse?.data || [];

    return <RoleManager initialData={rolesData} />;
  } catch (error) {
    console.error("Error loading roles:", error);
    // Return mock data if API fails for development
    // const mockRoles: IRole[] = [
    //   {
    //     id: 1,
    //     name: "Administrador",
    //     description: "Rol con acceso completo al sistema",
    //     is_active: true,
    //     permissions: [
    //       { id: 1, name: "Crear", action: "create", description: "Crear recursos" },
    //       { id: 2, name: "Editar", action: "edit", description: "Editar recursos" },
    //       { id: 3, name: "Eliminar", action: "delete", description: "Eliminar recursos" }
    //     ]
    //   },
    //   {
    //     id: 2,
    //     name: "Usuario",
    //     description: "Rol con acceso limitado",
    //     is_active: true,
    //     permissions: [
    //       { id: 4, name: "Leer", action: "read", description: "Leer recursos" }
    //     ]
    //   },
    //   {
    //     id: 3,
    //     name: "Invitado",
    //     description: "Rol de solo lectura",
    //     is_active: false,
    //     permissions: []
    //   }
    // ];
    
    return <RoleManager initialData={[]} />;
  }
};

export default RolesPage;
