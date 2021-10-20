import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { IProjectHealthReport } from '../../../../interfaces/project';
import { fallbackProject } from '../useProject/fallbackProject';
import useSort from '../../../useSort';
import { formatApiPath } from '../../../../utils/format-path';
import handleErrorResponses from '../httpErrorResponseHandler';

const useHealthReport = (id: string, options: SWRConfiguration = {}) => {
    const KEY = `api/admin/projects/${id}/health-report`;

    const fetcher = () => {
        const path = formatApiPath(`api/admin/projects/${id}/health-report`);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Health report'))
            .then(res => res.json());
    };

    const [sort] = useSort();

    const { data, error } = useSWR<IProjectHealthReport>(KEY, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    const sortedData = (
        data: IProjectHealthReport | undefined
    ): IProjectHealthReport => {
        if (data) {
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

export default useHealthReport;
