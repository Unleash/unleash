import { useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { createLocalStorage } from 'utils/createLocalStorage';
import { encodeQueryParams, useQueryParams } from 'use-query-params';
import type { QueryParamConfigMap } from 'serialize-query-params/src/types';
import {
    toUseQueryParamsConfig,
    type DecodedSpecMap,
    type QueryParamSpecMap,
} from 'utils/queryParamSpec';
import { reorderObject } from '../utils/reorderObject.js';
import {
    isValidPaginationOption,
    DEFAULT_PAGE_LIMIT,
} from 'utils/paginationConfig';

export type TableStateUpdate<TSpecs extends QueryParamSpecMap> =
    | Partial<DecodedSpecMap<TSpecs>>
    | ((prev: DecodedSpecMap<TSpecs>) => Partial<DecodedSpecMap<TSpecs>>);

export type TableStateSetter<TSpecs extends QueryParamSpecMap> = (
    update: TableStateUpdate<TSpecs>,
) => void;

const usePersistentSearchParams = (
    key: string,
    queryParamsDefinition: QueryParamConfigMap,
) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { value, setValue } = createLocalStorage<Record<string, unknown>>(
        key,
        {},
    );
    useEffect(() => {
        const params = Object.fromEntries(searchParams.entries());
        if (Object.keys(params).length > 0) {
            return;
        }
        if (Object.keys(value).length === 0) {
            return;
        }
        setSearchParams(
            encodeQueryParams(queryParamsDefinition, value) as Record<
                string,
                string
            >,
            { replace: true },
        );
    }, []);

    return setValue;
};

/**
 * Persistent (URL + localStorage) table state.
 *
 * Consumers declare params with the library-agnostic specs from
 * `utils/queryParamSpec`. During the use-query-params → nuqs migration this
 * hook converts those specs to a use-query-params config and runs
 * use-query-params only; the nuqs side of each spec is dormant. PR4
 * (nuqs-4-dual-run) turns this into a flag-gated dual-run.
 */
export const usePersistentTableState = <TSpecs extends QueryParamSpecMap>(
    key: string,
    specs: TSpecs,
    excludedFromStorage: (keyof TSpecs)[] = ['offset'],
) => {
    const queryParamsDefinition = useMemo(
        () => toUseQueryParamsConfig(specs),
        [specs],
    );
    const excluded = excludedFromStorage as string[];

    const updateStoredParams = usePersistentSearchParams(
        key,
        queryParamsDefinition,
    );

    const [tableState, setTableStateInternal] = useQueryParams(
        queryParamsDefinition,
        { updateType: 'replaceIn' },
    );

    const [searchParams] = useSearchParams();
    const orderedTableState = useMemo(() => {
        return reorderObject(tableState, [...searchParams.keys()]);
    }, [searchParams, tableState, reorderObject]);

    useEffect(() => {
        if (tableState.limit && !isValidPaginationOption(tableState.limit)) {
            setTableStateInternal((prevState) => ({
                ...prevState,
                limit: DEFAULT_PAGE_LIMIT,
                offset: 0, // Reset offset when changing limit
            }));
        }
    }, [tableState.limit, setTableStateInternal]);

    type SetTableStateInternalParam = Parameters<
        typeof setTableStateInternal
    >[0];

    const setTableState = useCallback(
        (newState: SetTableStateInternalParam) => {
            if (!queryParamsDefinition.offset) {
                return setTableStateInternal(newState);
            }
            if (typeof newState === 'function') {
                setTableStateInternal((prevState) => {
                    const updatedState = (newState as Function)(prevState);
                    return queryParamsDefinition.offset
                        ? {
                              offset: queryParamsDefinition.offset.decode('0'),
                              ...updatedState,
                          }
                        : updatedState;
                });
            } else {
                const updatedState = queryParamsDefinition.offset
                    ? {
                          offset: queryParamsDefinition.offset.decode('0'),
                          ...newState,
                      }
                    : newState;
                setTableStateInternal(updatedState);
            }
        },
        [setTableStateInternal, queryParamsDefinition.offset],
    );

    useEffect(() => {
        const filteredTableState = Object.fromEntries(
            Object.entries(orderedTableState).filter(
                ([key]) => !excluded.includes(key),
            ),
        );
        updateStoredParams(filteredTableState);
    }, [JSON.stringify(orderedTableState)]);

    return [
        orderedTableState as DecodedSpecMap<TSpecs>,
        setTableState as TableStateSetter<TSpecs>,
    ] as const;
};
