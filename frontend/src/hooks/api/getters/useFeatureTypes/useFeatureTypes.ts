import useSWR, { mutate } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import { IFeatureType } from '../../../../interfaces/featureTypes';

const useFeatureTypes = () => {
    const fetcher = async () => {
        const path = formatApiPath(`api/admin/feature-types`);
        const res = await fetch(path, {
            method: 'GET',
        });
        return res.json();
    };

    const KEY = `api/admin/feature-types`;

    const { data, error } = useSWR(KEY, fetcher);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        featureTypes: (data?.types as IFeatureType[]) || [],
        error,
        loading,
        refetch,
    };
};

export default useFeatureTypes;
