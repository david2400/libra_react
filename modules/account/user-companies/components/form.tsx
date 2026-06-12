/** @format */

"use client";

import { SubmitHandler } from "react-hook-form";
import {
  IFormAddProps,
  IFormProps,
  IFormUpdateProps,
} from "@repo/ui/form/models";
import { FormUserCompany } from "../scenes/formUserCompany";
import {
  validationUserCompany,
  validationUpdateUserCompany,
} from "../schemas/user-company.schema";
import {
  IUserCompanyCreateRequest,
  IUserCompanyUpdateRequest,
} from "../models/user-company.interface";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  createUserCompanyServerAction,
  updateUserCompanyServerAction,
} from "@/app/[locale]/(protected)/account/user-companies/[idCompanie]/actions";

interface FormBaseProps extends IFormProps<any> {
  users?: any[];
  companies?: any[];
  isUpdate?: boolean;
  companyId?: number;
}

const FormBase = ({
  initialValues,
  onSubmit,
  validationSchema,
  users,
  companies,
  isUpdate,
  companyId,
}: FormBaseProps) => {
  return (
    <FormUserCompany
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      users={users}
      companies={companies}
      isUpdate={isUpdate}
      companyId={companyId}
    />
  );
};

interface RegisterUserCompanyProps extends IFormAddProps {
  users?: any[];
  companies?: any[];
  onSuccess?: () => void;
  companyId?: number;
}

export const RegisterUserCompany = ({
  users = [],
  companies = [],
  onSuccess,
  companyId,
}: RegisterUserCompanyProps) => {
  const router = useRouter();
  const t = useTranslations("account.userCompanies.messages");
  const tMessages = useTranslations("messages");

  const defaultValues: IUserCompanyCreateRequest = {
    user_id: 0,
    company_id: companyId || 0,
    is_primary: false,
  };

  const handleSubmit: SubmitHandler<IUserCompanyCreateRequest> = async (
    values
  ) => {
    const result = await createUserCompanyServerAction({
      user_id: values.user_id,
      company_id: values.company_id,
      is_primary: values.is_primary,
    })
      .then(() => {
        Swal.fire({
          title: t("createSuccess"),
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
          willClose: () => {
            onSuccess?.();
            router.refresh();
          },
        });
      })
      .catch((error) => {
        Swal.fire({
          title: tMessages("createError", { entity: "asignación" }),
          text: (error as any)?.message || tMessages("unexpectedError"),
          icon: "error",
        });
      });
  };

  return (
    <FormBase
      initialValues={defaultValues}
      onSubmit={handleSubmit}
      validationSchema={validationUserCompany()}
      users={users}
      companies={companies}
      isUpdate={false}
      companyId={companyId}
    />
  );
};

interface UpdateUserCompanyProps
  extends IFormUpdateProps<IUserCompanyUpdateRequest> {
  users?: any[];
  companies?: any[];
}

export const UpdateUserCompany = ({
  initialValues,
  handleClose,
  users = [],
  companies = [],
}: UpdateUserCompanyProps) => {
  const router = useRouter();
  const t = useTranslations("account.userCompanies.messages");
  const tMessages = useTranslations("messages");

  const handleSubmit: SubmitHandler<IUserCompanyUpdateRequest> = async (
    values
  ) => {
    if (!values.user_id || !values.company_id) return;

    const result = await updateUserCompanyServerAction(
      values.user_id,
      values.company_id,
      {
        is_primary: values.is_primary,
      }
    )
      .then(() => {
        Swal.fire({
          title: t("updateSuccess"),
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
          willClose: () => {
            handleClose?.(false);
            router.refresh();
          },
        });
      })
      .catch((error) => {
        Swal.fire({
          title: tMessages("updateError", { entity: "asignación" }),
          text: (error as any)?.message || tMessages("unexpectedError"),
          icon: "error",
        });
      });
  };

  if (!initialValues) {
    return null;
  }

  return (
    <FormBase
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationUpdateUserCompany()}
      users={users}
      companies={companies}
      isUpdate={true}
    />
  );
};
