import { useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createLocalStorage } from 'utils/createLocalStorage';
import { encodeQueryParams, useQueryParams } from 'use-query-params';
import { QueryParamConfigMap } from 'serialize-query-params/src/types';

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

function reorderObject<T extends object>(obj: T, order: Array<keyof T>): T {
    // Create a set for quick lookup of the ordered keys
    const orderSet = new Set(order);

    // Object that will hold the ordered keys first
    const orderedObj: Partial<T> = {};

    // Add explicitly ordered keys to the ordered object
    order.forEach((key) => {
        if (key in obj) {
            orderedObj[key] = obj[key];
        }
    });

    // Add remaining keys that were not explicitly ordered
    Object.keys(obj).forEach((key) => {
        if (!orderSet.has(key as keyof T)) {
            orderedObj[key as keyof T] = obj[key as keyof T];
        }
    });

    return orderedObj as T;
}

export const usePersistentTableState = <T extends QueryParamConfigMap>(
    key: string,
    queryParamsDefinition: T,
) => {
    const updateStoredParams = usePersistentSearchParams(
        key,
        queryParamsDefinition,
    );

    const [tableState, setTableStateInternal] = useQueryParams(
        queryParamsDefinition,
    );

    const [searchParams] = useSearchParams();
    const orderedTableState = useMemo(() => {
        return reorderObject(tableState, [...searchParams.keys()]);
    }, [searchParams, tableState, reorderObject]);

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
        const { offset, ...rest } = orderedTableState;
        updateStoredParams(rest);
    }, [JSON.stringify(orderedTableState)]);

    return [orderedTableState, setTableState] as const;
};
