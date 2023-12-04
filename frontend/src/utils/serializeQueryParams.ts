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
