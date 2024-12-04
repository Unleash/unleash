import { useMemo } from 'react';
import useUiConfig from '../useUiConfig/useUiConfig';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import { useUiFlag } from 'hooks/useUiFlag';
import type { IReleasePlan } from 'interfaces/releasePlans';

const DEFAULT_DATA: IReleasePlan[] = [];

export const useReleasePlans = (
    projectId: string,
    featureName: string,
    environment?: string,
) => {
    const { isEnterprise } = useUiConfig();
    const releasePlansEnabled = useUiFlag('releasePlans');

    const { data, error, mutate } = useConditionalSWR<IReleasePlan[]>(
        isEnterprise() && releasePlansEnabled && Boolean(environment),
        DEFAULT_DATA,
        formatApiPath(
            `api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/release_plans`,
        ),
        fetcher,
    );

    return useMemo(
        () => ({
            releasePlans: data ?? [],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Release plans'))
        .then((res) => res.json());
};
