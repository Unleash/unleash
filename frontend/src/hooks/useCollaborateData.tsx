import { useState, useLayoutEffect, useEffect } from 'react';
import { SWRConfiguration, SWRResponse } from 'swr';
import { dequal } from 'dequal';
import { StaleDataNotification } from 'component/common/StaleDataNotification/StaleDataNotification';

const formatUnleashGetter = ({
    unleashGetter,
    dataKey = '',
    refetchFunctionKey = '',
    options = {},
    params = [],
}: IGetterOptions): { [key: string]: unknown } => {
    const result = unleashGetter(...params, { ...options, refreshInterval: 5 });

    return { data: result[dataKey], refetch: result[refetchFunctionKey] };
};

interface IGetterOptions {
    dataKey: string;
    unleashGetter: any;
    options: SWRConfiguration;
    refetchFunctionKey: string;
    params: string[];
}

const useCollaborateData = (
    getterOptions: IGetterOptions,
    initialData: unknown
) => {
    const { data, refetch } = formatUnleashGetter(getterOptions);
    const [cache, setCache] = useState(initialData || null);
    const [dataModified, setDataModified] = useState(false);

    const refreshCachedData = () => {
        setCache(data);
        setDataModified(false);
    };

    useEffect(() => {
        if (cache === null) {
            setCache(initialData);
        }
    }, [initialData]);

    useEffect(() => {
        const equal = dequal(data, cache);

        if (!equal) {
            setDataModified(true);
        }
    }, [data]);

    return {
        data: cache,
        refetch,
        Notification: (
            <StaleDataNotification
                refresh={refreshCachedData}
                show={dataModified}
            />
        ),
    };
};

export default useCollaborateData;
