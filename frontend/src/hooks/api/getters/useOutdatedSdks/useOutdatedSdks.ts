import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import type { OutdatedSdksSchema } from 'openapi';
import { formatApiPath } from 'utils/formatPath';

export const useOutdatedSdks = (project: string) => {
    const PATH = `api/admin/projects/${project}/sdks/outdated`;
    const { data, refetch, loading, error } = useApiGetter<OutdatedSdksSchema>(
        formatApiPath(PATH),
        () => fetcher(formatApiPath(PATH), 'Outdated SDKs'),
        { refreshInterval: 60 * 1000 },
    );

    return { data: data || { sdks: [] }, refetch, error };
};
