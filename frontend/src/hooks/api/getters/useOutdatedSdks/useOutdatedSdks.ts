import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter';
import { OutdatedSdksSchema } from '../../../../openapi';

const PATH = 'api/admin/metrics/sdks/outdated';

export const useOutdatedSdks = () => {
    const { data, refetch, loading, error } = useApiGetter<OutdatedSdksSchema>(
        PATH,
        () => fetcher(PATH, 'Outdated SDKs'),
        { refreshInterval: 60 * 1000 },
    );

    return { data: data || { sdks: [] }, refetch, error };
};
