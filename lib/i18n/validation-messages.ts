import { useTranslations } from 'next-intl';

export const useValidationMessages = () => {
  const t = useTranslations('validation');

  return {
    required: t('required'),
    requiredField: t('requiredField'),
    invalidEmail: t('invalidEmail'),
    invalidPhone: t('invalidPhone'),
    invalidUrl: t('invalidUrl'),
    minLength: (min: number) => t('minLength', { min }),
    maxLength: (max: number) => t('maxLength', { max }),
    min: (min: number) => t('min', { min }),
    max: (max: number) => t('max', { max }),
    mustMatch: t('mustMatch'),
    alphanumeric: t('alphanumeric'),
    numeric: t('numeric'),
    positiveNumber: t('positiveNumber'),
    invalidFormat: t('invalidFormat'),
  };
};

export type ValidationMessages = ReturnType<typeof useValidationMessages>;
