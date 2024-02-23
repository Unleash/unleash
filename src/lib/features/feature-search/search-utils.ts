import { Knex } from 'knex';
import { IQueryParam } from '../feature-toggle/types/feature-toggle-strategies-store-type';

export interface NormalizeParamsDefaults {
    limitDefault: number;
    maxLimit?: number; // Optional because you might not always want to enforce a max limit
    sortByDefault: string;
    typeDefault?: string; // Optional field for type, not required for every call
}

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
        switch (param.operator) {
            case 'IS':
            case 'IS_ANY_OF':
                query.whereIn(param.field, param.values);
                break;
            case 'IS_NOT':
            case 'IS_NONE_OF':
                query.whereNotIn(param.field, param.values);
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
    params,
    defaults: NormalizeParamsDefaults,
) => {
    const {
        query,
        offset,
        limit = defaults.limitDefault,
        sortOrder,
        sortBy = defaults.sortByDefault,
    } = params;

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

    const normalizedSortBy = sortBy;
    const normalizedSortOrder =
        sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'asc';

    return {
        normalizedQuery,
        normalizedLimit,
        normalizedOffset,
        normalizedSortBy,
        normalizedSortOrder,
    };
};
