import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';
import useUiConfig from '../useUiConfig/useUiConfig.js';
import type { ChangeRequestsCountSchema } from 'openapi';

const fallback: ChangeRequestsCountSchema = {
    applied: 0,
    approved: 0,
    rejected: 0,
    scheduled: 0,
    reviewRequired: 0,
    total: 0,
};

export const useChangeRequestsCount = (projectId: string) => {
    const { isEnterprise } = useUiConfig();
    const { data, error, mutate } =
        useConditionalSWR<ChangeRequestsCountSchema>(
            Boolean(projectId) && isEnterprise(),
            fallback,
            formatApiPath(
                `api/admin/projects/${projectId}/change-requests/count`,
            ),
            fetcher,
        );
    return {
        data: data || fallback,
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
