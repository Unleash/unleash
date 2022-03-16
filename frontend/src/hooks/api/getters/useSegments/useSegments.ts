import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { formatApiPath } from 'utils/format-path';
import handleErrorResponses from '../httpErrorResponseHandler';
import { ISegment } from 'interfaces/segment';

const PATH = formatApiPath('api/admin/segments');

export interface UseSegmentsOutput {
    segments: ISegment[];
    refetchSegments: () => void;
    loading: boolean;
    error?: Error;
}

export const useSegments = (options?: SWRConfiguration): UseSegmentsOutput => {
    const { data, error } = useSWR<{ segments: ISegment[] }>(
        PATH,
        fetchSegments,
        options
    );

    const refetchSegments = useCallback(() => {
        mutate(PATH).catch(console.warn);
    }, []);

    return {
        segments: data?.segments || [],
        refetchSegments,
        loading: !error && !data,
        error,
    };
};

const fetchSegments = () => {
    return fetch(PATH, { method: 'GET' })
        .then(handleErrorResponses('Segments'))
        .then(res => res.json());
};
