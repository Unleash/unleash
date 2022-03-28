import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { IProjectHealthReport } from 'interfaces/project';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';

interface IUseHealthReportOutput {
    healthReport: IProjectHealthReport | undefined;
    refetchHealthReport: () => void;
    loading: boolean;
    error?: Error;
}

export const useHealthReport = (
    projectId: string,
    options?: SWRConfiguration
): IUseHealthReportOutput => {
    const path = formatApiPath(`api/admin/projects/${projectId}/health-report`);

    const { data, error } = useSWR<IProjectHealthReport>(
        path,
        fetchHealthReport,
        options
    );

    const refetchHealthReport = useCallback(() => {
        mutate(path).catch(console.warn);
    }, [path]);

    return {
        healthReport: data,
        refetchHealthReport,
        loading: !error && !data,
        error,
    };
};

const fetchHealthReport = (path: string): Promise<IProjectHealthReport> => {
    return fetch(path)
        .then(handleErrorResponses('Health report'))
        .then(res => res.json());
};
