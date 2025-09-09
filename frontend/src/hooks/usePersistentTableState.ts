import { useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createLocalStorage } from 'utils/createLocalStorage';
import { encodeQueryParams, useQueryParams } from 'use-query-params';
import type { QueryParamConfigMap } from 'serialize-query-params/src/types';
import { reorderObject } from '../utils/reorderObject.js';
import {
    isValidPaginationOption,
    DEFAULT_PAGE_LIMIT,
} from 'utils/paginationConfig';

const usePersistentSearchParams = <T extends QueryParamConfigMap>(
    key: string,
    queryParamsDefinition: T,
) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { value, setValue } = createLocalStorage(key, {});
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

export const usePersistentTableState = <T extends QueryParamConfigMap>(
    key: string,
    queryParamsDefinition: T,
    excludedFromStorage: (keyof T)[] = ['offset'],
) => {
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
                ([key]) => !excludedFromStorage.includes(key),
            ),
        );
        updateStoredParams(filteredTableState);
    }, [JSON.stringify(orderedTableState)]);

    return [orderedTableState, setTableState] as const;
};
