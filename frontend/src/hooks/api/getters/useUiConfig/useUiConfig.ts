import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import { defaultValue } from './defaultValue';
import { IUiConfig } from 'interfaces/uiConfig';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useMemo, useCallback } from 'react';

interface IUseUIConfigOutput {
    uiConfig: IUiConfig;
    loading: boolean;
    error?: Error;
    refetch: () => void;
    isOss: () => boolean;
}

const useUiConfig = (): IUseUIConfigOutput => {
    const path = formatApiPath(`api/admin/ui-config`);
    const { data, error, mutate } = useSWR<IUiConfig>(path, fetcher);

    const isOss = useCallback(() => {
        return !data?.versionInfo?.current?.enterprise;
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
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('configuration'))
        .then(res => res.json());
};

export default useUiConfig;
