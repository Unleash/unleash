import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';

import { formatApiPath } from '../../../../utils/format-path';
import { IFeatureStrategy } from '../../../../interfaces/strategy';
import handleErrorResponses from '../httpErrorResponseHandler';

const useFeatureStrategy = (
    projectId: string,
    featureId: string,
    environmentId: string,
    strategyId: string,
    options: SWRConfiguration
) => {
    const fetcher = () => {
        const path = formatApiPath(
            `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/strategies/${strategyId}`
        );
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses(`Strategies for ${featureId}`))
            .then(res => res.json());
    };

    const FEATURE_STRATEGY_CACHE_KEY = strategyId;

    const { data, error } = useSWR<IFeatureStrategy>(
        FEATURE_STRATEGY_CACHE_KEY,
        fetcher,
        {
            ...options,
        }
    );

    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(FEATURE_STRATEGY_CACHE_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        strategy:
            data ||
            ({
                constraints: [],
                parameters: {},
                id: '',
                name: '',
            } as IFeatureStrategy),
        error,
        loading,
        refetch,
        FEATURE_STRATEGY_CACHE_KEY,
    };
};

export default useFeatureStrategy;
