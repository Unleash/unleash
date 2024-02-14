import { Knex } from 'knex';
import { IQueryParam } from '../feature-toggle/types/feature-toggle-strategies-store-type';

export const applySearchFilters = (
    qb: Knex.QueryBuilder,
    searchParams: string[] | undefined,
    columns: string[],
): void => {
    const hasSearchParams = searchParams?.length;
    if (hasSearchParams) {
        // Prepare SQL parameters
        const sqlParameters = searchParams.map((item) => `%${item}%`);
        const sqlQueryParameters = sqlParameters.map(() => '?').join(',');

        // Apply search filters based on the columns provided
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
