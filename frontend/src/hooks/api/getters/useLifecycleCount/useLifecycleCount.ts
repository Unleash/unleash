import { formatApiPath } from 'utils/formatPath';
import useSWR from 'swr';
import type { FeatureLifecycleCountSchema } from 'openapi';

export const useLifecycleCount = () => {
    const { data, error } = useSWR<FeatureLifecycleCountSchema>(
        formatApiPath('api/admin/lifecycle/count'),
    );

    return {
        lifecycleCount: data,
        error,
        loading: !error && !data,
    };
};
