import { encodeNumber, decodeNumber } from 'serialize-query-params';

/**
 * @see: https://github.com/pbeshai/use-query-params/issues/175#issuecomment-982791559
 */
export const SafeNumberParam = {
    encode: encodeNumber,
    decode: (input: any) => {
        const result = decodeNumber(input);
        return result == null ? result : Number.isNaN(result) ? null : result;
    },
};
