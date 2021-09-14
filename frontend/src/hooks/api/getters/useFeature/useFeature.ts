import useSWR, { mutate } from 'swr';
import { useState, useEffect } from 'react';

import { formatApiPath } from '../../../../utils/format-path';
import { IFeatureToggle } from '../../../../interfaces/featureToggle';
import { defaultFeature } from './defaultFeature';

const useFeature = (projectId: string, id: string) => {
    const fetcher = () => {
        const path = formatApiPath(
            `api/admin/projects/${projectId}/features/${id}`
        );
        return fetch(path, {
            method: 'GET',
        }).then(res => res.json());
    };

    const KEY = `api/admin/projects/${projectId}/features/${id}`;

    const { data, error } = useSWR<IFeatureToggle>(KEY, fetcher);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    let feature = defaultFeature;
    if (data) {
        if (data.environments) {
            feature = data;
        }
    }

    return {
        feature,
        error,
        loading,
        refetch,
    };
};

export default useFeature;
