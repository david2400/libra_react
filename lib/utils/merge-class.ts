import classNames from 'classnames'
import { twMerge } from "tailwind-merge";

type EntryValue = string | string[] | Entry | undefined;
interface Entry {
  [key: string]: EntryValue;
}

export function cn(...inputs: Parameters<typeof classNames>) {
  return twMerge(classNames(...inputs))
}

/**
 * Parse object entries from array to string and merge the tailwind css classes using `tailwind-merge`.
 * @param entry Object
 * @returns Object
 */
export function mergeTheme(entry: Entry) {
  const result: Record<string, unknown> = {};
  const defaultProps = entry?.["defaultProps"] as EntryValue;

  for (const key in entry) {
    if (key === "defaultProps") continue;
    const value = entry[key];
    if (Array.isArray(value)) {
      result[key] = twMerge(value.join(" "));
      continue;
    }
    if (typeof value === "object" && value !== null) {
      result[key] = mergeTheme(value as Entry);
      continue;
    }
    result[key] = value;
  }

  return defaultProps
    ? {
      ...result,
      defaultProps,
    }
    : result;
}

export default mergeTheme;
