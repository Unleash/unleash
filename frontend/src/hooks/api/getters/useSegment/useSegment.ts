import useSWR, { mutate } from 'swr';
import { useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { ISegment } from 'interfaces/segment';

export interface UseSegmentOutput {
    segment?: ISegment;
    refetchSegment: () => void;
    loading: boolean;
    error?: Error;
}

export const useSegment = (id: number): UseSegmentOutput => {
    const path = formatApiPath(`api/admin/segments/${id}`);
    const { data, error } = useSWR<ISegment>(path, () => fetchSegment(path));

    const refetchSegment = useCallback(() => {
        mutate(path).catch(console.warn);
    }, [path]);

    return {
        segment: data,
        refetchSegment,
        loading: !error && !data,
        error,
    };
};

const fetchSegment = (path: string) => {
    return fetch(path, { method: 'GET' })
        .then(handleErrorResponses('Segment'))
        .then(res => res.json());
};
