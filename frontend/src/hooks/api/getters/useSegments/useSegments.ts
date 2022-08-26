import useSWR from 'swr';
import { useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { ISegment } from 'interfaces/segment';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { IFlags } from 'interfaces/uiConfig';

export interface IUseSegmentsOutput {
    segments?: ISegment[];
    refetchSegments: () => void;
    loading: boolean;
    error?: Error;
}

export const useSegments = (strategyId?: string): IUseSegmentsOutput => {
    const { uiConfig } = useUiConfig();

    const { data, error, mutate } = useSWR(
        [strategyId, uiConfig.flags],
        fetchSegments,
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

export const fetchSegments = async (
    strategyId?: string,
    flags?: IFlags
): Promise<ISegment[]> => {
    if (!flags?.SE) {
        return [];
    }

    return fetch(formatSegmentsPath(strategyId))
        .then(handleErrorResponses('Segments'))
        .then(res => res.json())
        .then(res => res.segments);
};

const formatSegmentsPath = (strategyId?: string): string => {
    return strategyId
        ? formatApiPath(`api/admin/segments/strategies/${strategyId}`)
        : formatApiPath('api/admin/segments');
};
