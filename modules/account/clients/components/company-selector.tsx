/** @format */

"use client";

import React from "react";
import {
  HiOutlineBuildingOffice2,
  HiOutlineChevronDown,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

interface ICompany {
  id_company: number;
  name: string;
  nit: string;
  status: string;
}

interface CompanySelectorProps {
  companies: ICompany[];
  selectedCompanyId: number | null;
  onCompanyChange: (companyId: number) => void;
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  companies,
  selectedCompanyId,
  onCompanyChange,
}) => {
  const selectedCompany = companies.find(
    (c) => c.id_company === selectedCompanyId
  );

  if (companies.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <HiOutlineBuildingOffice2 className="h-5 w-5" />
          <span className="text-sm">No hay empresas asignadas</span>
        </div>
      </div>
    );
  }

  if (companies.length === 1) {
    return (
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <HiOutlineBuildingOffice2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{companies[0].name}</p>
            <p className="text-xs text-muted-foreground">
              NIT: {companies[0].nit}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <HiOutlineCheckCircle className="h-3.5 w-3.5" />
            Seleccionada
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="relative">
        <select
          value={selectedCompanyId || ""}
          onChange={(e) => onCompanyChange(Number(e.target.value))}
          className="w-full appearance-none rounded-xl border-0 bg-transparent px-4 py-4 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="" disabled>
            Selecciona una empresa
          </option>
          {companies.map((company) => (
            <option key={company.id_company} value={company.id_company}>
              {company.name} - NIT: {company.nit}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
          <HiOutlineChevronDown className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {selectedCompany && (
        <div className="border-t border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <HiOutlineBuildingOffice2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {selectedCompany.name}
              </p>
              <p className="text-xs text-muted-foreground">
                NIT: {selectedCompany.nit}
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                selectedCompany.status === "active"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}>
              {selectedCompany.status === "active" ? "Activa" : "Inactiva"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
