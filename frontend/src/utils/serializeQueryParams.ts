// Custom additional serializers for query params library
// used in `useQueryParams` hook

const encodeBoolean = (
    bool: boolean | null | undefined,
): string | null | undefined => {
    if (bool == null) {
        return bool;
    }

    return bool ? 'true' : 'false';
};

const decodeBoolean = (
    input: string | (string | null)[] | null | undefined,
): boolean | null | undefined => {
    if (input === 'true') {
        return true;
    }
    if (input === 'false') {
        return false;
    }

    return null;
};

export const BooleansStringParam = {
    encode: encodeBoolean,
    decode: decodeBoolean,
};

export type FilterItem = {
    operator: string;
    values: string[];
};

const encodeFilterItem = (
    filterItem: FilterItem | null | undefined,
): string | undefined => {
    return filterItem && filterItem.values.length
        ? `${filterItem.operator}:${filterItem.values.join(',')}`
        : undefined;
};

const decodeFilterItem = (
    input: string | (string | null)[] | null | undefined,
): FilterItem | null | undefined => {
    if (typeof input !== 'string' || !input) {
        return undefined;
    }

    const [operator, values = ''] = input.split(':');
    if (!operator) return undefined;

    const splitValues = values.split(',');
    return splitValues.length > 0
        ? { operator, values: splitValues }
        : undefined;
};

export const FilterItemParam = {
    encode: encodeFilterItem,
    decode: decodeFilterItem,
};
