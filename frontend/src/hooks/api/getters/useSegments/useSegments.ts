import { useCallback } from 'react';
import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { ISegment } from 'interfaces/segment';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export interface IUseSegmentsOutput {
    segments?: ISegment[];
    refetchSegments: () => void;
    loading: boolean;
    error?: Error;
}

export const useSegments = (strategyId?: string): IUseSegmentsOutput => {
    const { uiConfig } = useUiConfig();

    const url = strategyId
        ? formatApiPath(`api/admin/segments/strategies/${strategyId}`)
        : formatApiPath('api/admin/segments');

    const { data, error, mutate } = useSWR(url, () => fetchSegments(url), {
        refreshInterval: 15 * 1000,
    });

    const refetchSegments = useCallback(() => {
        mutate().catch(console.warn);
    }, [mutate]);

    return {
        segments: data,
        refetchSegments,
        loading: !error && !data,
        error,
    };
};

export const fetchSegments = async (url: string) => {
    return fetch(url)
        .then(handleErrorResponses('Segments'))
        .then((res) => res.json())
        .then((res) => res.segments);
};
