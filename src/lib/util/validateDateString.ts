import { isValid, parseISO } from 'date-fns';

export const validateDateString = (date?: string) => {
    if (typeof date === 'undefined') {
        return undefined;
    }
    const parsedDate = parseISO(date);

    if (!isValid(parsedDate)) {
        return undefined;
    }

    return date;
};
