import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IChangeRequestEnvironmentConfig } from 'component/changeRequest/changeRequest.types';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';

export const useChangeRequestConfig = (projectId: string) => {
    const { isEnterprise } = useUiConfig();
    console.log('----useChangeRequestConfig: ', isEnterprise(), projectId);
    console.log(
        '----useChangeRequestConfig: ',
        formatApiPath(`api/admin/projects/${projectId}/change-requests/config`),
    );
    const { data, error, mutate } = useConditionalSWR<
        IChangeRequestEnvironmentConfig[]
    >(
        Boolean(projectId) && isEnterprise(),
        [],
        formatApiPath(`api/admin/projects/${projectId}/change-requests/config`),
        fetcher,
    );
    console.log(data);
    return {
        data: data || [],
        loading: !error && !data,
        refetchChangeRequestConfig: mutate,
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Request changes'))
        .then((res) => res.json());
};
