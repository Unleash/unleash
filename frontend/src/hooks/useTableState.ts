import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createLocalStorage } from '../utils/createLocalStorage';

const filterObjectKeys = <T extends Record<string, unknown>>(
    obj: T,
    keys: Array<keyof T>,
) =>
    Object.fromEntries(
        Object.entries(obj).filter(([key]) => keys.includes(key as keyof T)),
    ) as T;

const defaultStoredKeys = [
    'pageSize',
    'search',
    'sortBy',
    'sortOrder',
    'favorites',
    'columns',
];
const defaultQueryKeys = [...defaultStoredKeys, 'page'];

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
 * @param defaultParams initial state
 * @param storageId identifier for the local storage
 * @param queryKeys array of elements to be saved in the url
 * @param storageKeys array of elements to be saved in local storage
 */
export const useTableState = <Params extends Record<string, string | string[]>>(
    defaultParams: Params,
    storageId: string,
    queryKeys?: Array<keyof Params>,
    storageKeys?: Array<keyof Params>,
) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { value: storedParams, setValue: setStoredParams } =
        createLocalStorage(`${storageId}:tableQuery`, defaultParams);

    const searchQuery = Object.fromEntries(searchParams.entries());
    const [params, setParams] = useState({
        ...defaultParams,
        ...(Object.keys(searchQuery).length ? {} : storedParams),
        ...searchQuery,
    } as Params);

    const updateParams = (value: Partial<Params>, reset = false) => {
        const newState: Params = reset
            ? { ...defaultParams, ...value }
            : {
                  ...params,
                  ...value,
              };

        // remove keys with undefined values
        Object.keys(newState).forEach((key) => {
            if (newState[key] === undefined) {
                delete newState[key];
            }
        });

        setParams(newState);
        setSearchParams(
            filterObjectKeys(newState, queryKeys || defaultQueryKeys),
        );
        setStoredParams(
            filterObjectKeys(newState, storageKeys || defaultStoredKeys),
        );

        return params;
    };

    return [params, updateParams] as const;
};
