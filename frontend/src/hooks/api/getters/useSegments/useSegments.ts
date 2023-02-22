import { useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { ISegment } from 'interfaces/segment';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';

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

    const { data, error, mutate } = useConditionalSWR(
        Boolean(uiConfig.flags?.SE),
        [],
        url,
        () => fetchSegments(url),
        {
            refreshInterval: 15 * 1000,
        }
    );

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
        .then(res => res.json())
        .then(res => res.segments);
};
