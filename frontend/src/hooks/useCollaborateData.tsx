import { useState, useEffect } from 'react';
import { SWRConfiguration } from 'swr';
import { dequal } from 'dequal';
import { StaleDataNotification } from 'component/common/StaleDataNotification/StaleDataNotification';

interface IFormatUnleashGetterOutput<Type> {
    data: Type;
    refetch: () => void;
}

const formatUnleashGetter = <Type,>({
    unleashGetter,
    dataKey = '',
    refetchFunctionKey = '',
    options = {},
    params = [''],
}: IGetterOptions): IFormatUnleashGetterOutput<Type> => {
    const result = unleashGetter(...params, { refreshInterval: 5, ...options });

    return { data: result[dataKey], refetch: result[refetchFunctionKey] };
};

interface IGetterOptions {
    dataKey: string;
    unleashGetter: any;
    options: SWRConfiguration;
    refetchFunctionKey: string;
    params: string[];
}

interface ICollaborateDataOutput<Type> {
    staleDataNotification: JSX.Element;
    data: Type | null;
    refetch: () => void;
    forceRefreshCache: (data: Type) => void;
}

interface IStaleNotificationOptions {
    afterSubmitAction: () => void;
}

export const useCollaborateData = <Type,>(
    getterOptions: IGetterOptions,
    initialData: Type,
    notificationOptions: IStaleNotificationOptions
): ICollaborateDataOutput<Type> => {
    const { data, refetch } = formatUnleashGetter<Type>(getterOptions);
    const [cache, setCache] = useState<Type | null>(initialData || null);
    const [dataModified, setDataModified] = useState(false);

    const forceRefreshCache = (data: Type) => {
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
        staleDataNotification: (
            <StaleDataNotification
                cache={cache}
                data={data}
                refresh={() => forceRefreshCache(data)}
                show={dataModified}
                afterSubmitAction={notificationOptions.afterSubmitAction}
            />
        ),
        forceRefreshCache,
    };
};
