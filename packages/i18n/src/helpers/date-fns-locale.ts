import type { Locale } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
// types
import type { TLanguage } from "../types";

/**
 * Maps application language codes to date-fns locale objects
 */
const DATE_FNS_LOCALE_MAP: Record<string, Locale> = {
  "zh-CN": zhCN,
  "en": enUS,
  // Add more locales as needed
  "en-US": enUS,
};

/**
 * Gets the date-fns locale object for the given language
 * @param language - The application language code
 * @returns The corresponding date-fns Locale object, defaults to enUS
 */
export function getDateFnsLocale(language: TLanguage): Locale {
  return DATE_FNS_LOCALE_MAP[language] || enUS;
}

