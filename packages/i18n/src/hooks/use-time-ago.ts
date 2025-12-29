import { useMemo } from "react";
import { calculateTimeAgo } from "@plane/utils";
// hooks
import { useTranslation } from "./use-translation";
// helpers
import { getDateFnsLocale } from "../helpers/date-fns-locale";

/**
 * Hook that provides a localized calculateTimeAgo function
 * @returns A function that calculates time ago with the current locale
 * @example
 * const { timeAgo } = useTimeAgo();
 * const result = timeAgo("2023-01-01"); // "1年前" or "1 year ago"
 */
export function useTimeAgo() {
  const { currentLocale } = useTranslation();
  
  const timeAgo = useMemo(() => {
    const locale = getDateFnsLocale(currentLocale);
    return (time: string | number | Date | null) => calculateTimeAgo(time, locale);
  }, [currentLocale]);

  return { timeAgo };
}

