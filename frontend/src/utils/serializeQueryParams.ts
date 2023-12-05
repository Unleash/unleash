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
): string | null | undefined => {
    if (filterItem == null) {
        return filterItem;
    }
    return filterItem.values.length
        ? `${filterItem.operator}:${filterItem.values.join(',')}`
        : undefined;
};

const decodeFilterItem = (
    input: string | (string | null)[] | null | undefined,
): FilterItem | null | undefined => {
    if (typeof input === 'string') {
        const [operator = '', values = ''] = input.split(':') || [];
        const splitValues = values.split(',');
        if (operator === '' || values.length === 0) {
            return undefined;
        }
        return { operator, values: splitValues };
    }
    return undefined;
};

export const FilterItemParam = {
    encode: encodeFilterItem,
    decode: decodeFilterItem,
};
