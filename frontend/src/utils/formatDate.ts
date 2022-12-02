export const formatDateYMDHMS = (
    date: number | string | Date,
    locale: string
): string => {
    return new Date(date).toLocaleString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

export const formatDateYMD = (
    date: number | string | Date,
    locale: string
): string => {
    return new Date(date).toLocaleString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export const formatDateHM = (
    date: number | string | Date,
    locale: string
): string => {
    return new Date(date).toLocaleString(locale, {
        hour: '2-digit',
        minute: '2-digit',
    });
};
