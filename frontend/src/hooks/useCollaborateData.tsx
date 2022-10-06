import { useState, useEffect } from 'react';
import { SWRConfiguration } from 'swr';
import { dequal } from 'dequal';
import { StaleDataNotification } from 'component/common/StaleDataNotification/StaleDataNotification';
import { IFeatureToggle } from 'interfaces/featureToggle';

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
    notificationOptions: IStaleNotificationOptions,
    comparisonModeratorFunc: (data: Type) => any
): ICollaborateDataOutput<Type> => {
    const { data, refetch } = formatUnleashGetter<Type>(getterOptions);
    const [cache, setCache] = useState<Type | null>(initialData || null);
    const [dataModified, setDataModified] = useState(false);

    const forceRefreshCache = (data: Type) => {
        setDataModified(false);
        setCache(data);
    };

    const formatDequalData = (data: Type | null) => {
        if (!data) return data;
        if (
            comparisonModeratorFunc &&
            typeof comparisonModeratorFunc === 'function'
        ) {
            return comparisonModeratorFunc(data);
        }
        return data;
    };

    useEffect(() => {
        if (cache === null) {
            setCache(initialData);
        }
    }, [initialData]);

    useEffect(() => {
        if (!cache || !data) return;

        const equal = dequal(formatDequalData(cache), formatDequalData(data));

        if (!equal) {
            setDataModified(true);
        }
    }, [data]);

    return {
        data: cache,
        refetch,
        staleDataNotification: (
            <StaleDataNotification
                cache={formatDequalData(cache)}
                data={formatDequalData(data)}
                refresh={() => forceRefreshCache(data)}
                show={dataModified}
                afterSubmitAction={notificationOptions.afterSubmitAction}
            />
        ),
        forceRefreshCache,
    };
};
