'use server';

import { getCompanyApplications } from "@/server/domains/access-control/security/company_applications";
import { ICompanyApplication } from "@/server/domains/access-control/security/company_applications/types";


export async function getCompanyApplicationsAction(): Promise<ICompanyApplication[]> {
    try {
        const response = await getCompanyApplications();
        return Array.isArray(response) ? response : response?.data || [];
    } catch (error) {
        console.error('Error cargando niveles educativos:', error);
        return [];
    }
}


export async function getCompanyAction(): Promise<ICompanyApplication[]> {
    try {
        const response = await getCompanyApplications();
        return Array.isArray(response) ? response : response?.data || [];
    } catch (error) {
        console.error('Error cargando niveles educativos:', error);
        return [];
    }
}