import { formatApiPath } from 'utils/formatPath';
import { useMemo } from 'react';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';
import type { IProjectRoleUsageCount } from 'interfaces/project';

export const useProjectRoleAccessUsage = (roleId?: number) => {
    const { isEnterprise } = useUiConfig();

    const { data, error, mutate } = useConditionalSWR(
        isEnterprise() && roleId,
        { projects: [] },
        formatApiPath(`api/admin/projects/roles/${roleId}/access`),
        fetcher,
    );

    return useMemo(
        () => ({
            projects: (data?.projects ?? []) as IProjectRoleUsageCount[],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Project role usage'))
        .then((res) => res.json());
};
