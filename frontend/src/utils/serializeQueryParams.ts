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

type TagFilterItem = FilterItem & { malformedTagEncoding?: string };

const structuredTagFilter =
    /^(INCLUDE|DO_NOT_INCLUDE|INCLUDE_ALL_OF|INCLUDE_ANY_OF|EXCLUDE_IF_ANY_OF|EXCLUDE_ALL)_JSON:([\s\S]*)$/;

export const TagFilterItemParam = {
    encode: (filter: TagFilterItem | null | undefined) => {
        if (filter?.malformedTagEncoding) {
            return filter.malformedTagEncoding;
        }
        if (filter?.values.some((value) => value.includes(','))) {
            return `${filter.operator}_JSON:${JSON.stringify(filter.values)}`;
        }
        return encodeFilterItem(filter);
    },
    decode: (
        input: Parameters<typeof decodeFilterItem>[0],
    ): TagFilterItem | null | undefined => {
        if (typeof input !== 'string') {
            return undefined;
        }
        const match = structuredTagFilter.exec(input);
        if (!match) {
            return decodeFilterItem(input);
        }

        const [, operator, payload] = match;
        try {
            const values: unknown = JSON.parse(payload);
            if (
                Array.isArray(values) &&
                values.length > 0 &&
                values.every(
                    (value) =>
                        typeof value === 'string' &&
                        /^[^:,]+:\s*\S/.test(value),
                )
            ) {
                return { operator, values };
            }
        } catch {
            // Keep the explicit filter so that a malformed URL reaches API validation.
        }
        return { operator, values: [], malformedTagEncoding: input };
    },
};
