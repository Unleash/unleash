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
    return filterItem?.values.length
        ? `${filterItem.operator}:${filterItem.values.join(',')}`
        : undefined;
};

const decodeFilterItem = (
    input: string | (string | null)[] | null | undefined,
): FilterItem | null | undefined => {
    if (typeof input !== 'string' || !input) {
        return undefined;
    }

    const pattern =
        /^(IS|IS_NOT|IS_ANY_OF|IS_NONE_OF|INCLUDE|DO_NOT_INCLUDE|INCLUDE_ALL_OF|INCLUDE_ANY_OF|EXCLUDE_IF_ANY_OF|EXCLUDE_ALL|IS_BEFORE|IS_ON_OR_AFTER):(.+)$/;
    const match = input.match(pattern);

    if (match) {
        return {
            operator: match[1],
            values: match[2].split(','),
        };
    }

    return undefined;
};

export const FilterItemParam = {
    encode: encodeFilterItem,
    decode: decodeFilterItem,
};
