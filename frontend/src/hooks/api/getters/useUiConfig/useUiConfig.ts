import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import { defaultValue } from './defaultValue';
import { IUiConfig } from '../../../../interfaces/uiConfig';
import handleErrorResponses from '../httpErrorResponseHandler';

const REQUEST_KEY = 'api/admin/ui-config';

const useUiConfig = (options: SWRConfiguration = {}) => {
    const fetcher = () => {
        const path = formatApiPath(`api/admin/ui-config`);

        return fetch(path, {
            method: 'GET',
            credentials: 'include',
        })
            .then(handleErrorResponses('configuration'))
            .then(res => res.json());
    };

    const { data, error } = useSWR<IUiConfig>(REQUEST_KEY, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(REQUEST_KEY);
    };

    const isOss = () => {
        if (data?.versionInfo?.current?.enterprise) {
            return false;
        } else if (!data || !data.versionInfo) {
            return false;
        }
        return true;
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        uiConfig: { ...defaultValue, ...data },
        error,
        loading,
        refetch,
        isOss,
    };
};

export default useUiConfig;
