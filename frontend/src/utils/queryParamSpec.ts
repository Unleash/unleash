import {
    ArrayParam,
    createEnumParam,
    encodeQueryParams,
    StringParam,
    withDefault,
    type QueryParamConfig,
} from 'use-query-params';
import {
    parseAsInteger,
    parseAsNativeArrayOf,
    parseAsString,
    parseAsStringLiteral,
    type ParserMap,
} from 'nuqs';
import {
    BooleansStringParam,
    FilterItemParam,
    type FilterItem,
} from './serializeQueryParams.ts';
import { SafeNumberParam } from './safeNumberParam.ts';
import { filterItemParam, strictBooleanParam } from './nuqsParams.ts';

type NuqsParser = ParserMap[string];

/**
 * Library-agnostic query param definition for the use-query-params → nuqs
 * migration. Each spec pairs the use-query-params config with the
 * equivalent nuqs parser, so the dual-run facades
 * (`usePersistentTableState`, `useDualQueryParams`) can drive either
 * library from a single declaration while the switch is flag-controlled,
 * and run the other as a read-only shadow for comparison.
 *
 * Once the migration is complete, specs collapse into their nuqs side and
 * this module disappears.
 */
export type QueryParamSpec<TDecoded> = {
    uqp: QueryParamConfig<any, TDecoded>;
    nuqs: NuqsParser;
};

export type QueryParamSpecMap = Record<string, QueryParamSpec<any>>;

export type DecodedSpecMap<TSpecs extends QueryParamSpecMap> = {
    [K in keyof TSpecs]: TSpecs[K] extends QueryParamSpec<infer TDecoded>
        ? TDecoded
        : never;
};

export const stringQueryParam: QueryParamSpec<string | null | undefined> = {
    uqp: StringParam,
    nuqs: parseAsString,
};

/** Number param that decodes NaN as absent instead of poisoning state. */
export const safeNumberQueryParam: QueryParamSpec<number | null | undefined> = {
    uqp: SafeNumberParam,
    nuqs: parseAsInteger,
};

/** Decodes only 'true'/'false'; anything else counts as absent. */
export const strictBooleanQueryParam: QueryParamSpec<
    boolean | null | undefined
> = {
    uqp: BooleansStringParam,
    nuqs: strictBooleanParam,
};

export const filterItemQueryParam: QueryParamSpec<
    FilterItem | null | undefined
> = {
    uqp: FilterItemParam,
    nuqs: filterItemParam,
};

/** Repeated-key array (`columns=a&columns=b`). */
export const stringArrayQueryParam: QueryParamSpec<
    (string | null)[] | null | undefined
> = {
    uqp: ArrayParam,
    nuqs: parseAsNativeArrayOf(parseAsString),
};

export const enumQueryParam = <TValue extends string>(
    values: readonly TValue[],
): QueryParamSpec<TValue | null | undefined> => ({
    uqp: createEnumParam([...values]),
    nuqs: parseAsStringLiteral(values),
});

export const withDefaultQueryParam = <TDecoded>(
    spec: QueryParamSpec<TDecoded>,
    defaultValue: NonNullable<TDecoded>,
): QueryParamSpec<NonNullable<TDecoded>> => ({
    uqp: withDefault(spec.uqp, defaultValue) as QueryParamConfig<
        any,
        NonNullable<TDecoded>
    >,
    // single and multi parser builders both have withDefault, but TS
    // reduces the method on their union to never
    nuqs: (
        spec.nuqs as {
            withDefault: (value: NonNullable<TDecoded>) => NuqsParser;
        }
    ).withDefault(defaultValue),
});

export const toUseQueryParamsConfig = <TSpecs extends QueryParamSpecMap>(
    specs: TSpecs,
): { [K in keyof TSpecs]: TSpecs[K]['uqp'] } => {
    return Object.fromEntries(
        Object.entries(specs).map(([key, spec]) => [key, spec.uqp]),
    ) as { [K in keyof TSpecs]: TSpecs[K]['uqp'] };
};

export const toNuqsParsers = <TSpecs extends QueryParamSpecMap>(
    specs: TSpecs,
): { [K in keyof TSpecs]: TSpecs[K]['nuqs'] } => {
    return Object.fromEntries(
        Object.entries(specs).map(([key, spec]) => [key, spec.nuqs]),
    ) as { [K in keyof TSpecs]: TSpecs[K]['nuqs'] };
};

/**
 * Encodes decoded values back to wire format (for API params and the
 * localStorage payload). Deliberately uses the use-query-params encoder
 * regardless of which library the flag selects, so API params and stored
 * state keep ONE deterministic shape during the migration.
 *
 * TODO(nuqs-cleanup): switch to `encodeParams` from `nuqsParams.ts` when
 * use-query-params is removed.
 */
export const encodeSpecParams = <TSpecs extends QueryParamSpecMap>(
    specs: TSpecs,
    values: Record<string, unknown>,
) => {
    return encodeQueryParams(
        toUseQueryParamsConfig(specs),
        values as Parameters<typeof encodeQueryParams>[1],
    );
};
