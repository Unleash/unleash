import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import { defaultValue } from './defaultValue.js';
import type { IUiConfig } from 'interfaces/uiConfig';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useMemo, useCallback } from 'react';

interface IUseUIConfigOutput {
    uiConfig: IUiConfig;
    loading: boolean;
    error?: Error;
    refetch: () => void;
    isOss: () => boolean;
    isPro: () => boolean;
    isEnterprise: () => boolean;
}

const useUiConfig = (): IUseUIConfigOutput => {
    const path = formatApiPath(`api/admin/ui-config`);
    const { data, error, mutate } = useSWR<IUiConfig>(path, fetcher);

    const isOss = useCallback(() => {
        return false;
    }, [data]);

    const isPro = useCallback(() => {
        return false;
    }, [data]);

    const isEnterprise = useCallback(() => {
        return true;
    }, [data]);

    const uiConfig: IUiConfig = useMemo(() => {
        return {
            ...defaultValue,
            ...data,
            flags: { ...defaultValue.flags, ...data?.flags },
        };
    }, [data]);

    return {
        uiConfig,
        loading: !error && !data,
        error,
        refetch: mutate,
        isOss,
        isPro,
        isEnterprise,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('configuration'))
        .then((res) => res.json());
};

export default useUiConfig;
