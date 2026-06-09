/** @format */

import { z } from "zod";
import { useValidationMessages } from "@/lib/i18n";

export const validationUserCompany = () => {
  const v = useValidationMessages();

  return z.object({
    user_id: z.number().min(1, { message: v.required }),
    company_id: z.number().min(1, { message: v.required }),
    is_primary: z.boolean().optional().default(false),
  });
};

export const validationUpdateUserCompany = () => {
  const v = useValidationMessages();

  return z.object({
    user_id: z.number().min(1, { message: v.required }),
    company_id: z.number().min(1, { message: v.required }),
    is_primary: z.boolean().optional(),
  });
};
