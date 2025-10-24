import { DEFAULT_PAGE_LIMIT } from 'hooks/api/getters/useChangeRequestSearch/useChangeRequestSearch';
import {
    NumberParam,
    StringParam,
    withDefault,
    type DecodedValueMap,
} from 'use-query-params';
import { FilterItemParam } from 'utils/serializeQueryParams';

export const stateConfig = {
    offset: withDefault(NumberParam, 0),
    limit: withDefault(NumberParam, DEFAULT_PAGE_LIMIT),
    sortBy: withDefault(StringParam, 'createdAt'),
    sortOrder: withDefault(StringParam, 'desc'),
    createdBy: FilterItemParam,
    requestedApproverId: FilterItemParam,
    state: FilterItemParam,
};

export type TableState = DecodedValueMap<typeof stateConfig>;
