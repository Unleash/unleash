import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import { formatApiPath } from 'utils/formatPath';
import type { ProjectFlagCreatorsSchema } from 'openapi';

export const useProjectFlagCreators = (project: string) => {
    const PATH = `api/admin/projects/${project}/flag-creators`;
    const { data, refetch, error } = useApiGetter<ProjectFlagCreatorsSchema>(
        formatApiPath(PATH),
        () => fetcher(formatApiPath(PATH), 'Flag creators'),
    );

    return { flagCreators: data || [], refetch, error };
};
