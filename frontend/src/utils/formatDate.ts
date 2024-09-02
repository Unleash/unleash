export const formatDateYMDHMS = (
    date: number | string | Date,
    locale?: string,
): string => {
    try {
        return new Date(date).toLocaleString(locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    } catch (e) {
        console.error(
            `Invalid toLocaleString locale: ${locale}, date: ${date}`,
            e,
        );
        return '';
    }
};

export const formatDateYMDHM = (
    date: number | string | Date,
    locale: string,
    timeZone?: string,
): string => {
    try {
        return new Date(date).toLocaleString(locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone,
        });
    } catch (e) {
        console.error(
            `Invalid toLocaleString locale: ${locale}, date: ${date}`,
            e,
        );
        return '';
    }
};

export const formatDateYMD = (
    date: number | string | Date,
    locale: string,
    timeZone?: string,
): string => {
    try {
        return new Date(date).toLocaleString(locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone,
        });
    } catch (e) {
        console.error(
            `Invalid toLocaleString locale: ${locale}, date: ${date}`,
            e,
        );
        return '';
    }
};

export const formatDateHM = (
    date: number | string | Date,
    locale: string,
): string => {
    try {
        return new Date(date).toLocaleString(locale, {
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (e) {
        console.error(
            `Invalid toLocaleString locale: ${locale}, date: ${date}`,
            e,
        );
        return '';
    }
};
