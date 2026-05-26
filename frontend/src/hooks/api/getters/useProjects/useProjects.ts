import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';

import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { GetProjectsParams, ProjectSchema, ProjectsSchema } from 'openapi';
import type { OnboardingStatusSchema } from 'openapi';

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

    const fetcher = () => {
        const path = formatApiPath(KEY);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Projects'))
            .then((res) => res.json());
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
