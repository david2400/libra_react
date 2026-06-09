/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, FormSelectField } from "@repo/ui/form/scenes";
import { Buttons } from "@repo/ui/buttons";
import { IFormProps } from "@repo/ui/form/models";
import { IUser } from "@/server/domains/access-control/account/users";
import { ICompany } from "@/server/domains/access-control/account/companies";

interface FormUserCompanyProps extends IFormProps<any> {
  users?: any[];
  companies?: any[];
  isUpdate?: boolean;
  companyId?: number;
}

export const FormUserCompany = ({
  initialValues,
  validationSchema,
  onSubmit,
  users = [],
  companies = [],
  isUpdate = false,
  companyId,
}: FormUserCompanyProps) => {
  const t = useTranslations("account.userCompanies");
  const tCommon = useTranslations("common");
  type UserCompanyInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserCompanyInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const userOptions = users.map((user) => ({
    value: user.id_user!.toString(),
    label: user.username,
  }));

  const companyOptions = companies.map((company) => ({
    value: company.id_company.toString(),
    label: `${company.name} - ${company.nit}`,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-12 gap-4">
        <FormSelectField
          controller={{ control, name: "user_id" }}
          label={t("fields.user")}
          data={userOptions}
          placeholder="Seleccionar usuario..."
          disabled={isUpdate}
          error={errors.user_id?.message}
          className="col-span-12"
        />

        <FormSelectField
          controller={{ control, name: "company_id" }}
          label={t("fields.company")}
          data={companyOptions}
          placeholder="Seleccionar empresa..."
          disabled={isUpdate || !!companyId}
          error={errors.company_id?.message}
          className="col-span-12"
        />

        <FormField
          controller={{ control, name: "is_primary" }}
          label={t("fields.is_primary")}
          type="checkbox"
          className="col-span-12"
        />
      </div>
      <Buttons type="submit" loading={isSubmitting} className="w-full">
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
