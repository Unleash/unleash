export const isValidPositiveInteger = (value: string): boolean => {
    return value === '' || /^\d+$/.test(value);
};

export const isValidPositiveDecimal = (value: string): boolean => {
    return value === '' || /^\d*\.?\d*$/.test(value);
};

export const parsePositiveInteger = (value: string): number => {
    if (value === '') {
        return 0;
    }

    if (isValidPositiveInteger(value)) {
        return Number.parseInt(value, 10);
    }

    return 0;
};

export const parsePositiveDecimal = (value: string): number => {
    if (value === '') {
        return 0;
    }

    if (isValidPositiveDecimal(value)) {
        return Number(value);
    }

    return 0;
};
