import {
    ArrayParam,
    encodeQueryParams,
    StringParam,
    withDefault,
} from 'use-query-params';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import {
    BooleansStringParam,
    FilterItemParam,
} from 'utils/serializeQueryParams';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import mapValues from 'lodash.mapvalues';
import type { SearchFeaturesParams } from 'openapi';
import { SafeNumberParam } from 'utils/safeNumberParam';
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
        offset: withDefault(SafeNumberParam, 0),
        limit: withDefault(SafeNumberParam, DEFAULT_PAGE_LIMIT),
        query: StringParam,
        favoritesFirst: withDefault(BooleansStringParam, true),
        sortBy: withDefault(StringParam, 'createdAt'),
        sortOrder: withDefault(StringParam, 'desc'),
        columns: ArrayParam,
        tag: FilterItemParam,
        state: FilterItemParam,
        createdAt: FilterItemParam,
        lastSeenAt: FilterItemParam,
        type: FilterItemParam,
        createdBy: FilterItemParam,
        archived: FilterItemParam,
        lifecycle: FilterItemParam,
    };
    const [tableState, setTableState] = usePersistentTableState(
        `${storageKey}-${projectId}`,
        stateConfig,
    );

    const { columns: _, ...apiTableState } = tableState;
    const { features, total, refetch, loading, initialLoad } = useFeatureSearch(
        mapValues(
            {
                ...encodeQueryParams(stateConfig, apiTableState),
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
