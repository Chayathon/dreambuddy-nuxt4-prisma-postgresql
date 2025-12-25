import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";

dayjs.extend(relativeTime);
dayjs.extend(buddhistEra);

export const useDate = () => {
    const getLocale = (): string => {
        if (typeof window === "undefined") return "en";
        try {
            const v = localStorage.getItem("dreambuddy-locale");
            if (v === "th" || v === "en") return v;
        } catch (e) {}
        return "en";
    };

    const formatDateRelative = (date: string | Date): string => {
        const locale = getLocale();
        return dayjs(date).locale(locale).fromNow();
    };

    const formatDateFull = (date: string | Date): string => {
        const locale = getLocale();

        switch (locale) {
            case "th":
                return dayjs(date).locale(locale).format("D MMM BBBB");
            case "en":
            default:
                return dayjs(date).locale(locale).format("D MMM YYYY");
        }
    };

    const formatDateTimeFull = (date: string | Date): string => {
        const locale = getLocale();

        switch (locale) {
            case "th":
                return dayjs(date).locale(locale).format("D MMM BBBB HH:mm");
            case "en":
            default:
                return dayjs(date).locale(locale).format("D MMM YYYY HH:mm");
        }
    };

    return {
        formatDateRelative,
        formatDateFull,
        formatDateTimeFull,
    };
};
