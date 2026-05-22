import { getAllCompaniesServerAction } from "@/app/[locale]/(protected)/account/companies/actions";
import { getAllApplicationsServerAction } from "@/app/[locale]/(protected)/security/applications/actions";

export async function getAllCompanyAction() {
    try {
        const company = await getAllCompaniesServerAction();

        return company;
    } catch (error) {
        console.error("Failed to fetch company:", error);
        return [];
    }
}


export async function getAllApplications() {
    try {
        const company = await getAllApplicationsServerAction();

        return company;
    } catch (error) {
        console.error("Failed to fetch company:", error);
        return [];
    }
}
