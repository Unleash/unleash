import { createParser, type ParserMap } from 'nuqs';
import type { FilterItem } from './serializeQueryParams.ts';

/**
 * nuqs ports of the custom `use-query-params` serializers in
 * `serializeQueryParams.ts` / `safeNumberParam.ts`.
 *
 * Differences from the originals are forced by the nuqs parser contract:
 * - `parse` must return `null` (not `undefined`) for invalid input
 * - `serialize` always returns a string; clearing a param is done by
 *   setting the state value to `null`, not by serializing to `undefined`
 */

const FILTER_ITEM_OPERATORS =
    /^(IS|IS_NOT|IS_ANY_OF|IS_NONE_OF|INCLUDE|DO_NOT_INCLUDE|INCLUDE_ALL_OF|INCLUDE_ANY_OF|EXCLUDE_IF_ANY_OF|EXCLUDE_ALL|IS_BEFORE|IS_ON_OR_AFTER):(.+)$/;

export const filterItemParam = createParser<FilterItem>({
    parse(value) {
        const match = value.match(FILTER_ITEM_OPERATORS);
        if (!match) {
            return null;
        }
        return {
            operator: match[1],
            values: match[2].split(','),
        };
    },
    serialize(filterItem) {
        return `${filterItem.operator}:${filterItem.values.join(',')}`;
    },
    eq(a, b) {
        return (
            a.operator === b.operator &&
            a.values.length === b.values.length &&
            a.values.every((value, index) => value === b.values[index])
        );
    },
});

/**
 * Unlike nuqs' bundled `parseAsBoolean` (which decodes anything that isn't
 * 'true' as `false`), this decodes only 'true'/'false' and treats anything
 * else as absent, like the original `BooleansStringParam`.
 */
export const strictBooleanParam = createParser<boolean>({
    parse(value) {
        if (value === 'true') {
            return true;
        }
        if (value === 'false') {
            return false;
        }
        return null;
    },
    serialize: String,
});

/**
 * Object-to-object encoder replacing `encodeQueryParams` from
 * `serialize-query-params`: runs each value through its parser's
 * `serialize` and drops absent values. Used for API/SWR params and
 * the localStorage payload in `usePersistentTableState.nuqs.ts`.
 *
 * Multi parsers (e.g. `parseAsNativeArrayOf`) serialize to `string[]`.
 */
export const encodeParams = (
    parsers: ParserMap,
    values: Record<string, unknown>,
): Record<string, string | string[] | undefined> => {
    return Object.fromEntries(
        Object.entries(parsers).map(([key, parser]) => {
            const value = values[key];
            if (value === null || value === undefined) {
                return [key, undefined];
            }
            return [key, parser.serialize(value)];
        }),
    );
};

/**
 * Builds URLSearchParams from an encoded record, appending each item of
 * a multi-parser array as a repeated key (`columns=a&columns=b`).
 */
export const encodedParamsToSearchParams = (
    encoded: Record<string, string | string[] | undefined>,
): URLSearchParams =>
    new URLSearchParams(
        Object.entries(encoded).flatMap(([key, value]) =>
            value === undefined
                ? []
                : Array.isArray(value)
                  ? value.map((item) => [key, item])
                  : [[key, value]],
        ),
    );
