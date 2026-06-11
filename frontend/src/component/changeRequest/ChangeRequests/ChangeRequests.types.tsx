import { DEFAULT_PAGE_LIMIT } from 'hooks/api/getters/useChangeRequestSearch/useChangeRequestSearch';
import {
    filterItemQueryParam,
    safeNumberQueryParam,
    stringQueryParam,
    withDefaultQueryParam,
    type DecodedSpecMap,
} from 'utils/queryParamSpec';

export const stateConfig = {
    offset: withDefaultQueryParam(safeNumberQueryParam, 0),
    limit: withDefaultQueryParam(safeNumberQueryParam, DEFAULT_PAGE_LIMIT),
    sortBy: withDefaultQueryParam(stringQueryParam, 'createdAt'),
    sortOrder: withDefaultQueryParam(stringQueryParam, 'desc'),
    createdBy: filterItemQueryParam,
    requestedApproverId: filterItemQueryParam,
    state: filterItemQueryParam,
};

export type TableState = DecodedSpecMap<typeof stateConfig>;
