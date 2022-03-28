import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { getProjectFetcher } from './getProjectFetcher';
import { IProject } from 'interfaces/project';
import { fallbackProject } from './fallbackProject';
import useSort from 'hooks/useSort';

const useProject = (id: string, options: SWRConfiguration = {}) => {
    const { KEY, fetcher } = getProjectFetcher(id);
    const [sort] = useSort();

    const { data, error } = useSWR<IProject>(KEY, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    const sortedData = (data: IProject | undefined): IProject => {
        if (data) {
            // @ts-expect-error
            return { ...data, features: sort(data.features || []) };
        }
        return fallbackProject;
    };

    return {
        project: sortedData(data),
        error,
        loading,
        refetch,
    };
};

export default useProject;
