import { getAllApplicationsServerAction } from "@/app/[locale]/(protected)/security/applications/actions";
import { getAllModuleApplicationsServerAction } from "@/app/[locale]/(protected)/security/modules-applications/actions";


export async function getAllApplications() {
    try {
        const company = await getAllApplicationsServerAction();

        return company;
    } catch (error) {
        console.error("Failed to fetch company:", error);
        return [];
    }
}

export async function getAllModuleApplications() {
    try {
        const company = await getAllModuleApplicationsServerAction();

        return company;
    } catch (error) {
        console.error("Failed to fetch company:", error);
        return [];
    }
}