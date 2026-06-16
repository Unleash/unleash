import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import {
    encodeSpecParams,
    filterItemQueryParam,
    safeNumberQueryParam,
    strictBooleanQueryParam,
    stringArrayQueryParam,
    stringQueryParam,
    withDefaultQueryParam,
} from 'utils/queryParamSpec';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import mapValues from 'lodash.mapvalues';
import type { SearchFeaturesParams } from 'openapi';
import { DEFAULT_PAGE_LIMIT } from 'utils/paginationConfig';

type Attribute =
    | { key: 'tag'; operator: 'INCLUDE' }
    | { key: 'type'; operator: 'IS' }
    | { key: 'createdBy'; operator: 'IS' };

export const useProjectFeatureSearch = (
    projectId: string,
    storageKey = 'project-overview-v2',
    refreshInterval = 15 * 1000,
) => {
    const stateConfig = {
        offset: withDefaultQueryParam(safeNumberQueryParam, 0),
        limit: withDefaultQueryParam(safeNumberQueryParam, DEFAULT_PAGE_LIMIT),
        query: stringQueryParam,
        favoritesFirst: withDefaultQueryParam(strictBooleanQueryParam, true),
        sortBy: withDefaultQueryParam(stringQueryParam, 'createdAt'),
        sortOrder: withDefaultQueryParam(stringQueryParam, 'desc'),
        columns: stringArrayQueryParam,
        tag: filterItemQueryParam,
        state: filterItemQueryParam,
        createdAt: filterItemQueryParam,
        lastSeenAt: filterItemQueryParam,
        type: filterItemQueryParam,
        createdBy: filterItemQueryParam,
        archived: filterItemQueryParam,
        lifecycle: filterItemQueryParam,
        favorite: filterItemQueryParam,
    };
    const [tableState, setTableState] = usePersistentTableState(
        `${storageKey}-${projectId}`,
        stateConfig,
    );

    const apiTableState = tableState;
    const { features, total, refetch, loading, initialLoad } = useFeatureSearch(
        mapValues(
            {
                ...encodeSpecParams(stateConfig, apiTableState),
                project: `IS:${projectId}`,
            },
            (value) => (value ? `${value}` : undefined),
        ) as SearchFeaturesParams,
        {
            refreshInterval,
        },
    );

    return {
        features,
        total,
        refetch,
        loading,
        initialLoad,
        tableState,
        setTableState,
    };
};

export const useProjectFeatureSearchActions = (
    tableState: ReturnType<typeof useProjectFeatureSearch>['tableState'],
    setTableState: ReturnType<typeof useProjectFeatureSearch>['setTableState'],
) => {
    const onAttributeClick = (attribute: Attribute, value: string) => {
        const attributeState = tableState[attribute.key];

        if (
            attributeState &&
            attributeState.values.length > 0 &&
            !attributeState.values.includes(value)
        ) {
            setTableState({
                [attribute.key]: {
                    operator: attributeState.operator,
                    values: [...attributeState.values, value],
                },
            });
        } else if (!attributeState) {
            setTableState({
                [attribute.key]: {
                    operator: attribute.operator,
                    values: [value],
                },
            });
        }
    };

    const onTagClick = (tag: string) =>
        onAttributeClick({ key: 'tag', operator: 'INCLUDE' }, tag);
    const onFlagTypeClick = (type: string) =>
        onAttributeClick({ key: 'type', operator: 'IS' }, type);
    const onAvatarClick = (userId: number) =>
        onAttributeClick(
            { key: 'createdBy', operator: 'IS' },
            userId.toString(),
        );

    return {
        onFlagTypeClick,
        onTagClick,
        onAvatarClick,
    };
};
