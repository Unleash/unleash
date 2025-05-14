import type { Knex } from 'knex';
import type {
    IQueryOperator,
    IQueryParam,
} from '../feature-toggle/types/feature-toggle-strategies-store-type.js';

export interface NormalizeParamsDefaults {
    limitDefault: number;
    maxLimit?: number; // Optional because you might not always want to enforce a max limit
    typeDefault?: string; // Optional field for type, not required for every call
}

export type SearchParams = {
    query?: string;
    offset?: string | number;
    limit?: string | number;
    sortOrder?: 'asc' | 'desc';
};

export type NormalizedSearchParams = {
    normalizedQuery?: string[];
    normalizedLimit: number;
    normalizedOffset: number;
    normalizedSortOrder: 'asc' | 'desc';
};

export const applySearchFilters = (
    qb: Knex.QueryBuilder,
    searchParams: string[] | undefined,
    columns: string[],
): void => {
    const hasSearchParams = searchParams?.length;
    if (hasSearchParams) {
        const sqlParameters = searchParams.map((item) => `%${item}%`);
        const sqlQueryParameters = sqlParameters.map(() => '?').join(',');

        qb.where((builder) => {
            columns.forEach((column) => {
                builder.orWhereRaw(
                    `(${column}) ILIKE ANY (ARRAY[${sqlQueryParameters}])`,
                    sqlParameters,
                );
            });
        });
    }
};

export const applyGenericQueryParams = (
    query: Knex.QueryBuilder,
    queryParams: IQueryParam[],
): void => {
    queryParams.forEach((param) => {
        const isSingleParam = param.values.length === 1;
        switch (param.operator) {
            case 'IS':
            case 'IS_ANY_OF':
                query.whereIn(param.field, param.values);
                break;
            case 'IS_NOT':
            case 'IS_NONE_OF':
                if (isSingleParam) {
                    query.whereNot(param.field, param.values[0]);
                } else {
                    query.whereNotIn(param.field, param.values);
                }
                break;
            case 'IS_BEFORE':
                query.where(param.field, '<', param.values[0]);
                break;
            case 'IS_ON_OR_AFTER':
                query.where(param.field, '>=', param.values[0]);
                break;
        }
    });
};

export const normalizeQueryParams = (
    params: SearchParams,
    defaults: NormalizeParamsDefaults,
): NormalizedSearchParams => {
    const { query, offset, limit = defaults.limitDefault, sortOrder } = params;

    const normalizedQuery = query
        ?.split(',')
        .map((query) => query.trim())
        .filter((query) => query);

    const maxLimit = defaults.maxLimit || 1000;
    const normalizedLimit =
        Number(limit) > 0 && Number(limit) <= maxLimit
            ? Number(limit)
            : defaults.limitDefault;

    const normalizedOffset = Number(offset) > 0 ? Number(offset) : 0;

    const normalizedSortOrder =
        sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'asc';

    return {
        normalizedQuery,
        normalizedLimit,
        normalizedOffset,
        normalizedSortOrder,
    };
};

export const parseSearchOperatorValue = (
    field: string,
    value: string,
): IQueryParam | null => {
    const pattern =
        /^(IS|IS_NOT|IS_ANY_OF|IS_NONE_OF|INCLUDE|DO_NOT_INCLUDE|INCLUDE_ALL_OF|INCLUDE_ANY_OF|EXCLUDE_IF_ANY_OF|EXCLUDE_ALL|IS_BEFORE|IS_ON_OR_AFTER):(.+)$/;
    const match = value.match(pattern);

    if (match) {
        return {
            field,
            operator: match[1] as IQueryOperator,
            values: match[2].split(',').map((value) => value.trim()),
        };
    }

    return null;
};
