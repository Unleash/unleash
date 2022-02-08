import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IFeatureToggle } from '../../../../interfaces/featureToggle';

const PATH = formatApiPath('api/admin/archive/features');

export interface UseFeaturesArchiveOutput {
    archivedFeatures: IFeatureToggle[];
    refetchArchived: () => void;
    loading: boolean;
    error?: Error;
}

export const useFeaturesArchive = (
    options?: SWRConfiguration
): UseFeaturesArchiveOutput => {
    const { data, error } = useSWR<{ features: IFeatureToggle[] }>(
        PATH,
        fetchArchivedFeatures,
        options
    );

    const refetchArchived = useCallback(() => {
        mutate(PATH).catch(console.warn);
    }, []);

    return {
        archivedFeatures: data?.features || [],
        refetchArchived,
        loading: !error && !data,
        error,
    };
};

const fetchArchivedFeatures = () => {
    return fetch(PATH, { method: 'GET' })
        .then(handleErrorResponses('Archive'))
        .then(res => res.json());
};
