import { DEFAULT_PAGE_LIMIT } from 'hooks/api/getters/useChangeRequestSearch/useChangeRequestSearch';
import { type inferParserType, parseAsInteger, parseAsString } from 'nuqs';
import { filterItemParam } from 'utils/nuqsParams';

export const stateConfig = {
    offset: parseAsInteger.withDefault(0),
    limit: parseAsInteger.withDefault(DEFAULT_PAGE_LIMIT),
    sortBy: parseAsString.withDefault('createdAt'),
    sortOrder: parseAsString.withDefault('desc'),
    createdBy: filterItemParam,
    requestedApproverId: filterItemParam,
    state: filterItemParam,
};

export type TableState = inferParserType<typeof stateConfig>;
