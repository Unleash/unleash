import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';

import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { GetProjectsParams, ProjectSchema, ProjectsSchema } from 'openapi';
import type { OnboardingStatusSchema } from 'openapi';
import { useImpactMetricsHistogram } from 'hooks/useImpactMetrics';

// TODO: `onboardingStatus` and `cleanupCount` are currently gated behind the 'newProjectList' flag
// and not included on `projectSchema` (see openapi/spec/project-schema.ts).
// When the flag is removed and the fields are declared on the schema, drop this alias
// and let the generated `ProjectSchema` type carry the fields.
export type ProjectListItem = ProjectSchema & {
    onboardingStatus?: OnboardingStatusSchema;
    cleanupCount?: number;
};

const useProjects = (options: SWRConfiguration & GetProjectsParams = {}) => {
    const KEY = `api/admin/projects${options.archived ? '?archived=true' : ''}`;

    const { observe } = useImpactMetricsHistogram(
        'project_list_load_ms',
        'Client-side load time for the project list',
        [50, 100, 200, 500, 1000, 2000, 5000],
    );

    const fetcher = () => {
        const path = formatApiPath(KEY);
        const start = performance.now();
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Projects'))
            .then((res) => res.json())
            .then((data) => {
                observe(performance.now() - start);
                return data;
            });
    };

    const { data, error } = useSWR<{ projects: ProjectsSchema['projects'] }>(
        KEY,
        fetcher,
        options,
    );
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        projects: data?.projects || [],
        error,
        loading,
        refetch,
    };
};

export default useProjects;
