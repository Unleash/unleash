import { encodeNumber, decodeNumber } from 'serialize-query-params';

export const SafeNumberParam = {
    encode: encodeNumber,
    decode: (input: any) => {
        const result = decodeNumber(input);
        return result == null ? result : Number.isNaN(result) ? null : result;
    },
};
