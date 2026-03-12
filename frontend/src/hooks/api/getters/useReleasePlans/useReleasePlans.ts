import { useMemo } from 'react';
import useUiConfig from '../useUiConfig/useUiConfig.js';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';
import type { IReleasePlan } from 'interfaces/releasePlans';

const DEFAULT_DATA: IReleasePlan[] = [];

export const useReleasePlans = (
    projectId: string,
    featureName: string,
    environment?: string,
) => {
    // When featureReleasePlans flag is enabled, release plans come embedded in the
    // feature payload, so we don't need to fetch them separately from this endpoint.
    const { data, error, mutate } = useConditionalSWR<IReleasePlan[]>(
        false,
        DEFAULT_DATA,
        formatApiPath(
            `api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/release-plans`,
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
