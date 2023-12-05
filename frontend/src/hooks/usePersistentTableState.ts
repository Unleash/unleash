import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createLocalStorage } from 'utils/createLocalStorage';
import { useQueryParams, encodeQueryParams } from 'use-query-params';
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

    const [tableState, setTableState] = useQueryParams(queryParamsDefinition);

    useEffect(() => {
        const { offset, ...rest } = tableState;
        updateStoredParams(rest);
    }, [JSON.stringify(tableState)]);

    return [tableState, setTableState] as const;
};
