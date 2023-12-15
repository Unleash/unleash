import { useEffect } from 'react';
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

    type SetTableStateInternalParam = Parameters<
        typeof setTableStateInternal
    >[0];

    const setTableState = (newState: SetTableStateInternalParam) => {
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
    };

    useEffect(() => {
        const { offset, ...rest } = tableState;
        updateStoredParams(rest);
    }, [JSON.stringify(tableState)]);

    return [tableState, setTableState] as const;
};
