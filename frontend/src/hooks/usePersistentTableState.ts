import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createLocalStorage } from 'utils/createLocalStorage';
import { useQueryParams } from 'use-query-params';

const usePersistentSearchParams = (key: string) => {
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

        setSearchParams(value, { replace: true });
    }, []);

    return setValue;
};

export const usePersistentTableState = <
    T extends Parameters<typeof useQueryParams>[0],
>(
    key: string,
    queryParamsDefinition: T,
) => {
    const updateStoredParams = usePersistentSearchParams(key);

    const [tableState, setTableState] = useQueryParams(queryParamsDefinition);

    useEffect(() => {
        const { offset, ...rest } = tableState;
        updateStoredParams(rest);
    }, [JSON.stringify(tableState)]);

    return [tableState, setTableState] as const;
};
