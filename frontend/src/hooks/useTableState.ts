import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createLocalStorage } from '../utils/createLocalStorage';

const filterObjectKeys = <T extends Record<string, unknown>>(
    obj: T,
    keys: Array<keyof T>,
) =>
    Object.fromEntries(
        Object.entries(obj).filter(([key]) => keys.includes(key as keyof T)),
    ) as T;

export const defaultStoredKeys = [
    'pageSize',
    'sortBy',
    'sortOrder',
    'favorites',
    'columns',
];
export const defaultQueryKeys = [
    ...defaultStoredKeys,
    'search',
    'query',
    'page',
];

/**
 * There are 3 sources of params, in order of priority:
 *   1. local state
 *   2. search params from the url
 *   3. stored params in local storage
 *   4. default parameters
 *
 * `queryKeys` will be saved in the url
 * `storedKeys` will be saved in local storage
 *
 * @deprecated
 *
 * @param defaultParams initial state
 * @param storageId identifier for the local storage
 * @param queryKeys array of elements to be saved in the url
 * @param storageKeys array of elements to be saved in local storage
 */
export const useTableState = <Params extends Record<string, string>>(
    defaultParams: Params,
    storageId: string,
    queryKeys?: Array<keyof Params | string>,
    storageKeys?: Array<keyof Params | string>,
) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { value: storedParams, setValue: setStoredParams } =
        createLocalStorage(`${storageId}:tableQuery`, defaultParams);

    const searchQuery = Object.fromEntries(searchParams.entries());
    const hasQuery = Object.keys(searchQuery).length > 0;
    const [state, setState] = useState({
        ...defaultParams,
    });
    const params = useMemo(
        () =>
            ({
                ...state,
                ...(hasQuery ? {} : storedParams),
                ...searchQuery,
            }) as Params,
        [hasQuery, storedParams, searchQuery],
    );

    useEffect(() => {
        const urlParams = filterObjectKeys(
            params,
            queryKeys || defaultQueryKeys,
        );
        if (!hasQuery && Object.keys(urlParams).length > 0) {
            setSearchParams(urlParams, { replace: true });
        }
    }, [params, hasQuery, setSearchParams, queryKeys]);

    const updateParams = useCallback(
        (value: Partial<Params>, quiet = false) => {
            const newState: Params = {
                ...params,
                ...value,
            };

            // remove keys with undefined values
            Object.keys(newState).forEach((key) => {
                if (newState[key] === undefined) {
                    delete newState[key];
                }
            });

            if (!quiet) {
                setState(newState);
            }
            setSearchParams(
                filterObjectKeys(newState, queryKeys || defaultQueryKeys),
            );
            setStoredParams(
                filterObjectKeys(newState, storageKeys || defaultStoredKeys),
            );

            return params;
        },
        [setState, setSearchParams, setStoredParams],
    );

    return [params, updateParams] as const;
};
