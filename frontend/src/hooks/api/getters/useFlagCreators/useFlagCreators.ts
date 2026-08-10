import useSWR from 'swr';
import { fetcher } from '../useApiGetter/useApiGetter.js';
import { formatApiPath } from 'utils/formatPath';
import type { FlagCreatorsSchema } from 'openapi';

export const useFlagCreators = () => {
    const url = formatApiPath('api/admin/flag-creators?limit=10000');
    const { data } = useSWR<FlagCreatorsSchema>(url, () =>
        fetcher(url, 'Flag creators'),
    );

    return { flagCreators: data?.flagCreators ?? [] };
};
