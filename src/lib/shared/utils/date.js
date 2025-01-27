import { format } from "date-fns-tz/format";
import { parseISO } from "date-fns/parseISO/index.js";
import es from "date-fns/locale/es/index.js";
import zh from "date-fns/locale/zh-CN/index.js";
import pt from "date-fns/locale/pt/index.js";

/**
 * NYT-formatted month names
 */
export const nytMonths =
  "Jan. Feb. March April May June July Aug. Sept. Oct. Nov. Dec.".split(" ");

/**
 * Given a valid date string, return a timestamp in a specific TZ
 * Ex.: 2023-04-08T09:00:31.000Z -> 2023-04-08T05:00:31.000Z
 * @param {string} date
 * @param {string} timezone
 */
export const formatYYYYMMDD = (date, timezone = "America/New_York") => {
  const firstPublishedIso = parseISO(date);
  return format(firstPublishedIso, "yyyy-MM-dd'T'HH:mm:ssXXX", {
    timeZone: timezone,
  });
};

/**
 * Given a valid date and a timezone, return an NYT-standard date format in English
 * Ex.: 2023-09-08T09:00:31.000Z -> Sept. 8, 2023
 * @param {Date} date
 * @param {string} timezone
 */
export const formatDate = (date, timezone = "America/New_York") => {
  const thisMonth = format(date, "M", { timeZone: timezone });

  // format using NYT abbreviations
  const formattedMonth = nytMonths[+thisMonth - 1];
  const formattedDayYear = format(date, "d, Y", { timeZone: timezone });

  return `${formattedMonth} ${formattedDayYear}`;
};

/**
 * Given a valid date string, a language code and a timezone, return localised NYT-standard date format
 * Ex.: 2023-04-08T09:00:31.000Z -> April 8, 2023
 * Ex.: 2023-04-08T09:00:31.000Z -> 8 de abril de 2023
 * Ex.: 2023-04-08T09:00:31.000Z -> 2023年4月8日
 * @param {string} date
 * @param {object} language
 * @param {string} timezone
 */
export const formatDateLanguage = (
  date,
  language = { code: "en" },
  timezone = "America/New_York",
) => {
  const [languageCode] = language.code.split("-");
  const firstPublishedIso = parseISO(date);

  const formatters = {
    en: formatDate,
    es: (date, timezone) =>
      format(date, "d 'de' MMMM 'de' Y", { locale: es, timeZone: timezone }),
    zh: (date, timezone) =>
      format(date, "Y年M月d日", { locale: zh, timeZone: timezone }),
    pt: (date, timezone) =>
      format(date, "d 'de' MMMM 'de' Y", { locale: pt, timeZone: timezone }),
  };

  const formatter = formatters[languageCode];

  if (formatter) {
    return formatter(firstPublishedIso, timezone);
  }

  return formatters.en(firstPublishedIso, timezone);
};
